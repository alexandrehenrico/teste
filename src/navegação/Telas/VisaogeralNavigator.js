import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import VisaoGeral from '../../screens/home/VisaoGeral';
import { useData } from '../../screens/home/DataContext';

const Stack = createStackNavigator();

export default function VisaogeralNavigator() {
  const { isLoading } = useData();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#058301" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName="VisaoGeral">
      <Stack.Screen 
        name="VisaoGeral" 
        component={VisaoGeral} 
        options={{ title: '', headerTransparent: true, headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
