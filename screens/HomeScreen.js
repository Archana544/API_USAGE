import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { getUVData, saveUVRecord } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [uvData, setUvData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Permission denied');

        const location = await Location.getCurrentPositionAsync({});
        const data = await getUVData(
          location.coords.latitude,
          location.coords.longitude
        );
        setUvData(data);
        await saveUVRecord(data);
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      const data = await getUVData(coords.latitude, coords.longitude);
      setUvData(data);
      await saveUVRecord(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Current UV Index: {uvData?.result?.uv}</Text>
      <Text style={styles.riskLevel}>Risk: {uvData?.result?.uv_max_risk}</Text>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.button, styles.detailButton]}
          onPress={() => navigation.navigate('Details', { uvData })}
        >
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.tipsButton]}
          onPress={() => navigation.navigate('Safety Tips', { uvData })}
        >
          <Text style={styles.buttonText}>Safety Tips</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.mapButton]}
          onPress={() => navigation.navigate('UVMap', { 
            initialLocation: {
              latitude: uvData.lat,
              longitude: uvData.lng
            }
          })}
        >
          <Text style={styles.buttonText}>View Map</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.refreshButton]}
          onPress={handleRefresh}
        >
          <Text style={styles.buttonText}>Refresh Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20
  },
  loader: {
    flex: 1,
    justifyContent: 'center'
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 5 
  },
  riskLevel: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666'
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center'
  },
  button: { 
    padding: 15, 
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center'
  },
  detailButton: { 
    backgroundColor: '#6200EE' 
  },
  tipsButton: {
    backgroundColor: '#03DAC6'
  },
  mapButton: {
    backgroundColor: '#FF6D00'
  },
  refreshButton: {
    backgroundColor: '#9E9E9E'
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold',
    fontSize: 16
  }
});