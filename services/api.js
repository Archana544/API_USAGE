// services/api.js
import { db } from './firebase';
import { 
  doc, setDoc, collection, query, orderBy,
  onSnapshot, GeoPoint, serverTimestamp,
  enableNetwork, disableNetwork
} from 'firebase/firestore';

// Configuration Constants
const OPENUV_CONFIG = {
  API_KEY: "openuv-17x20jrmds02vse-io",
  BASE_URL: "https://api.openuv.io/api/v1/uv",
  REQUEST_TIMEOUT: 10000, // 10 seconds
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// Connection State Manager
const connectionState = {
  isOnline: true,
  retryAttempts: 0,
  maxRetries: 3,
  listeners: new Set(),
  
  setOnlineStatus(isOnline) {
    this.isOnline = isOnline;
    this.retryAttempts = isOnline ? 0 : this.retryAttempts;
    this.listeners.forEach(listener => listener(isOnline));
  }
};

// Network-Resilient Request Handler
const makeNetworkRequest = async (operation) => {
  try {
    if (connectionState.isOnline) {
      await enableNetwork(db);
    }
    return await operation();
  } catch (error) {
    connectionState.retryAttempts++;
    
    if (connectionState.retryAttempts >= connectionState.maxRetries) {
      connectionState.setOnlineStatus(false);
      await disableNetwork(db);
      throw error;
    }

    // Exponential backoff
    await new Promise(resolve => 
      setTimeout(resolve, Math.pow(2, connectionState.retryAttempts) * 100)
    );
    return makeNetworkRequest(operation);
  }
};

// OpenUV API Client
const uvDataCache = new Map();

const fetchUVData = async (lat, lng) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENUV_CONFIG.REQUEST_TIMEOUT);

  try {
    const headers = new Headers({
      "x-access-token": OPENUV_CONFIG.API_KEY,
      "Content-Type": "application/json"
    });

    const url = new URL(OPENUV_CONFIG.BASE_URL);
    url.searchParams.append('lat', lat);
    url.searchParams.append('lng', lng);
    url.searchParams.append('alt', 100); // Default altitude

    const response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const getUVData = async (lat, lng) => {
  // Validate coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number' ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Invalid coordinates provided');
  }

  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = uvDataCache.get(cacheKey);

  // Return cached data if valid
  if (cached && Date.now() - cached.timestamp < OPENUV_CONFIG.CACHE_DURATION) {
    return cached.data;
  }

  const data = await makeNetworkRequest(() => fetchUVData(lat, lng));
  const result = { ...data, lat, lng };

  uvDataCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });

  return result;
};

// Firestore Operations
const writeQueue = {
  queue: [],
  isProcessing: false,
  pendingWrites: new Set(),

  async add(operation, key) {
    if (this.pendingWrites.has(key)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject, key });
      this.pendingWrites.add(key);
      this.process();
    });
  },

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const { operation, resolve, reject, key } = this.queue.shift();
    
    try {
      const result = await makeNetworkRequest(operation);
      resolve(result);
    } catch (error) {
      if (error.code === 'unavailable') {
        console.warn('Operation queued for offline sync');
        resolve(null); // Graceful degradation
      } else {
        reject(error);
      }
    } finally {
      this.pendingWrites.delete(key);
      this.isProcessing = false;
      this.process();
    }
  }
};

export const saveUVRecord = async (data) => {
  const writeKey = `uv-${data.lat}-${data.lng}-${Date.now()}`;
  
  return writeQueue.add(async () => {
    const docRef = doc(collection(db, 'uvExposure'));
    await setDoc(docRef, {
      uvIndex: data.result.uv,
      riskLevel: data.result.uv_max_risk,
      location: new GeoPoint(data.lat, data.lng),
      timestamp: serverTimestamp(),
      _metadata: {
        status: connectionState.isOnline ? 'synced' : 'pending',
        retryCount: connectionState.retryAttempts,
        createdAt: new Date().toISOString()
      }
    });
    return docRef.id;
  }, writeKey);
};

// Real-time Listener with Throttling
export const useUVHistory = () => {
  const [records, setRecords] = useState([]);
  const changesRef = useRef(new Map());
  const processTimer = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'uvExposure'),
      orderBy('timestamp', 'desc')
    );

    const processChanges = () => {
      const changes = Array.from(changesRef.current.values());
      changesRef.current.clear();

      setRecords(prev => {
        const newRecords = [...prev];
        changes.forEach(change => {
          const idx = newRecords.findIndex(r => r.id === change.doc.id);
          const docData = change.doc.data();
          const record = {
            id: change.doc.id,
            ...docData,
            timestamp: docData.timestamp?.toDate() || new Date()
          };

          if (idx >= 0) {
            newRecords[idx] = record;
          } else if (change.type === 'added') {
            newRecords.push(record);
          }
        });
        return newRecords.sort((a, b) => b.timestamp - a.timestamp);
      });
    };

    const unsubscribe = onSnapshot(q, {
      includeMetadataChanges: true
    }, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        changesRef.current.set(change.doc.id, change);
      });

      // Throttle updates to once per second
      clearTimeout(processTimer.current);
      processTimer.current = setTimeout(processChanges, 1000);
    });

    return () => {
      clearTimeout(processTimer.current);
      unsubscribe();
    };
  }, []);

  return records;
};

// Connection Monitoring Hook
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    connectionState.listeners.add(setIsOnline);
    return () => connectionState.listeners.delete(setIsOnline);
  }, []);

  return isOnline;
};

// Risk Color Utility
export const getRiskColor = (uvIndex) => {
  const num = Number(uvIndex);
  if (isNaN(num)) return '#9E9E9E';
  if (num < 3) return '#4CAF50';
  if (num < 6) return '#FFC107';
  if (num < 8) return '#FF9800';
  if (num < 11) return '#F44336';
  return '#673AB7';
};