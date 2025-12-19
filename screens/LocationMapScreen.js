import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { getUVData } from '../services/api';

// Utility function to generate nearby coordinates
const generateNearbyLocations = (centerLat, centerLng, radiusKm = 5, count = 4) => {
  const locations = [];
  for (let i = 0; i < count; i++) {
    // Convert km to degrees (~111km per degree)
    const radiusDeg = radiusKm / 111;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radiusDeg;
    
    const lat = centerLat + (distance * Math.cos(angle));
    const lng = centerLng + (distance * Math.sin(angle));
    
    // Validate coordinates
    if (isValidCoordinate(lat, lng)) {
      locations.push({
        name: `Point ${i+1}`,
        lat,
        lng
      });
    }
  }
  return locations;
};

// Validate coordinate values
const isValidCoordinate = (lat, lng) => {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    !isNaN(lat) && 
    !isNaN(lng) &&
    lat >= -90 && 
    lat <= 90 &&
    lng >= -180 && 
    lng <= 180
  );
};

export default function LocationMapScreen() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyUVData, setNearbyUVData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRiskColor = (uvIndex) => {
    if (uvIndex < 3) return '#4CAF50'; // Green
    if (uvIndex < 6) return '#FFC107'; // Yellow
    if (uvIndex < 8) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get user location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Location permission denied');

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        if (!isValidCoordinate(location.coords.latitude, location.coords.longitude)) {
          throw new Error('Invalid current location coordinates');
        }
        
        setCurrentLocation(location.coords);

        // 2. Generate and fetch nearby locations dynamically
        const nearbyLocations = generateNearbyLocations(
          location.coords.latitude,
          location.coords.longitude,
          5,  // 5km radius
          4   // 4 nearby points
        );

        // 3. Fetch UV data for all locations
        const allLocations = [
          { 
            name: "Your Location", 
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            isCurrent: true 
          },
          ...nearbyLocations
        ];

        const locationsWithUV = await Promise.all(
          allLocations.map(async loc => {
            try {
              const uvData = await getUVData(loc.lat, loc.lng);
              return {
                ...loc,
                uvData,
                isValid: isValidCoordinate(loc.lat, loc.lng)
              };
            } catch (err) {
              console.error(`Failed to fetch UV data for location ${loc.name}:`, err);
              return {
                ...loc,
                uvData: null,
                isValid: false
              };
            }
          })
        );

        setNearbyUVData(locationsWithUV.filter(loc => loc.isValid));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading UV data for your area...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 0,
          longitude: currentLocation?.longitude || 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {nearbyUVData.map((location, index) => {
          const uvIndex = location.uvData?.result?.uv || 0;
          
          return (
            <Marker
              key={index}
              coordinate={{
                latitude: location.lat,
                longitude: location.lng
              }}
            >
              <View style={[styles.marker, { backgroundColor: getRiskColor(uvIndex) }]}>
                <Text style={styles.markerText}>{uvIndex.toFixed(1)}</Text>
                {location.isCurrent && (
                  <View style={styles.currentLocationIndicator} />
                )}
              </View>
            </Marker>
          );
        })}

        {/* Show search radius */}
        {currentLocation && (
          <Circle
            center={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            }}
            radius={5000} // 5km in meters
            strokeWidth={1}
            strokeColor="#1a66ff"
            fillColor="rgba(26, 102, 255, 0.1)"
          />
        )}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text>Low (0-2.9)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text>Moderate (3-5.9)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text>High (6-7.9)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text>Extreme (8+)</Text>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.85,
  },
  marker: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white'
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold'
  },
  currentLocationIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'blue'
  },
  legend: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2
  },
  legendColor: {
    width: 15,
    height: 15,
    marginRight: 8,
    borderRadius: 3
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20
  }
});