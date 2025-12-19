import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import SafetyTipsScreen from './screens/SafetyTipsScreen';
import LocationMapScreen from './screens/LocationMapScreen'

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SunSafe' }} />
        <Stack.Screen name="Details" component={DetailScreen} options={{ title: 'UV Details' }} />
        <Stack.Screen name="Safety Tips" component={SafetyTipsScreen} options={{ title: 'Exposure Safety' }} />
        <Stack.Screen name="UVMap" component={LocationMapScreen} options={{ title: 'UV Map' }} />
  
      </Stack.Navigator>
    </NavigationContainer>
  );
}