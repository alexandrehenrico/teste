//.App.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../../screens/home/gps/Homescreen";
import MapScreen from "../../screens/home/gps/MapScreen";
import SavedAreasScreen from "../../screens/home/gps/SavedAreasScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitle: '', // Remove o título padrão
        headerShown: false, // Exibe o cabeçalho (pode ser desativado para ocultar completamente)
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{title: '', headerTransparent: true, headerShown: false }} // Título personalizado para Home
      />
      <Stack.Screen 
        name="MapScreen" 
        component={MapScreen} 
      />
      <Stack.Screen 
        name="SavedAreas" 
        component={SavedAreasScreen} 
      />
    </Stack.Navigator>
  );
}