import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../../screens/home/propriedades/screens/HomeScreen';
import AddPropertyScreen from '../../screens/home/propriedades/screens/AddPropertyScreen';
import PropertyDetailsScreen from '../../screens/home/propriedades/screens/PropertyDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{title: '', headerTransparent: true, headerShown: false}} 
        />
        <Stack.Screen 
          name="AddProperty" 
          component={AddPropertyScreen} 
          options={{ title: '', headerTransparent: true, headerShown: false}}
           
        />
        <Stack.Screen 
          name="PropertyDetails" 
          component={PropertyDetailsScreen} 
          options={{title: '', headerTransparent: true, headerShown: false}} 
        />
      </Stack.Navigator>
  );
}