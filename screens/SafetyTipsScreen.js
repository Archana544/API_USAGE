
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function SafetyTipsScreen({ route }) {
  const { uvData } = route.params;
  const uvIndex = uvData?.result?.uv || 0;

  const getSafetyTips = () => {
    if (uvIndex < 3) return {
      level: 'Low',
      tips: [
        'Wear sunglasses on bright days',
        'Apply SPF 15+ if spending extended time outside',
        'Reflective surfaces like snow/water can double UV exposure'
      ]
    };
    if (uvIndex < 6) return {
      level: 'Moderate',
      tips: [
        'Apply SPF 30+ sunscreen every 2 hours',
        'Wear a wide-brimmed hat',
        'Seek shade during midday hours',
        'Wear UV-protective clothing'
      ]
    };
    if (uvIndex < 8) return {
      level: 'High',
      tips: [
        'Apply SPF 50+ sunscreen liberally',
        'Wear sunglasses with UV protection',
        'Limit sun exposure between 10am-4pm',
        'Use extra caution near water/snow'
      ]
    };
    return {
      level: 'Extreme',
      tips: [
        'Avoid sun exposure between 10am-4pm',
        'Apply SPF 50+ every 60-80 minutes',
        'Wear long sleeves and pants',
        'Seek shade constantly',
        'Wear a wide-brimmed hat and UV-blocking sunglasses'
      ]
    };
  };

  const { level, tips } = getSafetyTips();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.uvLevel}>UV Index: {uvIndex.toFixed(1)} ({level})</Text>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Protection Tips:</Text>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2
  },
  uvLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 2
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start'
  },
  bullet: {
    marginRight: 8,
    fontSize: 16
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22
  }
});