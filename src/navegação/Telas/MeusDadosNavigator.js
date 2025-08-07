import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../../screens/home/meusdados/ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Profile"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#005c1e', // Cor do header
          },
          headerTintColor: '#fff', // Cor do texto do header
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Tela Profile */}
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: '', headerTransparent: true, headerShown: false }} // Título do header
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;