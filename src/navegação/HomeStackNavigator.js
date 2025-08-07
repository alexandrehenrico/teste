import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/home/meusdados/ProfileScreen'
import MainNavigator from './MainNavigator';
import AnimalStack from './Telas/AnimalStack';
import DespesasNavigator from './Telas/DespesasNavigator';
import MdaNavigator from './Telas/MdaNavigator';
import PropriedadesNavigator from './Telas/PropriedadesNavigator';
import GpsNavigator from './Telas/GpsNavigator';
import ReceitasNavigator from './Telas/ReceitasNavigator'
import Pagar from '../screens/home/Pagar';
import RebanhoNavigator from '../navegação/Telas/RebanhoNavigator';
import Trabalhadores from '../screens/home/Trabalhadores';
import Grafico from '../screens/home/Grafico';

const Stack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '', headerTransparent: true, headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '', headerTransparent: true, headerShown: false }} 
      />
      <Stack.Screen 
        name="Main" 
        component={MainNavigator} 
        options={{ title: '', headerTransparent: true, headerShown: false }} 
      />
      <Stack.Screen 
        name="GPS" 
        component={GpsNavigator} 
        options={{ title: '', headerTransparent: true, headerShown: false }} 
      />
      <Stack.Screen
        name="Despesas"
        component={DespesasNavigator}
        options={{ title: '', headerTransparent: true, headerShown: false }}
      />
      <Stack.Screen
        name="Mão De Obra"
        component={MdaNavigator}
        options={{ title: '', headerTransparent: true, headerShown: false }}
      />
      <Stack.Screen 
        name="Propriedades" 
        component={PropriedadesNavigator} 
        options={{ title: '', headerTransparent: true, headerShown: false }} 
      />
      <Stack.Screen 
        name="Gestão de Animais" 
        component={AnimalStack} 
        options={{title: '', headerTransparent: true, headerShown: false }} 
      />
      <Stack.Screen 
        name="Receitas" 
        component={ReceitasNavigator} 
        options={{title: '', headerTransparent: true, headerShown: false }} 
      />
            <Stack.Screen 
        name="Pagar" 
        component={Pagar} 
        options={{title: '', headerTransparent: true, headerShown: false}} 
      />
            <Stack.Screen 
        name="RebanhoNavigator" 
        component={RebanhoNavigator} 
        options={{title: '', headerTransparent: true, headerShown: false }} 
      />
            <Stack.Screen 
        name="Trabalhadores" 
        component={Trabalhadores} 
        options={{ title: '', headerTransparent: true, headerShown: false }} 
      />
      <Stack.Screen 
        name="Grafico" 
        component={Grafico} 
        options={{ title: '', headerTransparent: true, headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

export default HomeStackNavigator;
