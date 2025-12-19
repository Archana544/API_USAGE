import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DetailsScreen({ route }) {
  const { uvData } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>UV Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Current Index:</Text>
          <Text style={styles.value}>{uvData.result.uv.toFixed(1)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Max Today:</Text>
          <Text style={styles.value}>{uvData.result.uv_max.toFixed(1)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Risk Level:</Text>
          <Text style={styles.value}>{uvData.result.uv_max_risk}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Ozone Level:</Text>
          <Text style={styles.value}>{uvData.result.ozone.toFixed(1)} DU</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Safe Exposure:</Text>
          <Text style={styles.value}>
            {uvData.result.safe_exposure_time?.st6 || 'N/A'} mins (Skin Type VI)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  label: {
    fontSize: 16,
    color: '#666'
  },
  value: {
    fontSize: 16,
    fontWeight: '600'
  }
});