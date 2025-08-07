import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnimalCadastrado from '../../screens/home/gestaodeanimais/src/screens/AnimalCadastrado';
import DetalhesAnimal from '../../screens/home/gestaodeanimais/src/screens/DetalhesAnimal';

const Stack = createStackNavigator();

export default function AnimalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Animais Cadastrados" component={AnimalCadastrado} options={{ title: '', headerTransparent: true, headerShown: false }} />
      <Stack.Screen name="Detalhes Animal" component={DetalhesAnimal}  />
    </Stack.Navigator>
  );
}
