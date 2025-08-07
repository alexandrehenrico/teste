import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import HomeStackNavigator from './HomeStackNavigator'; // O Stack Navigator que gerencia Home e Meus Dados
import Notícias from '../screens/home/Notícias';
import Conversor from '../screens/home/Conversor';
import ChatBot from '../screens/home/ChatBot';
import VisãoGeral from '../screens/home/VisaoGeral';
import Tarefas from '../screens/home/Tarefas';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Início" // Define "Início" como a aba inicial
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Início') {
            iconName = 'home';
          } else if (route.name === 'Notícias') {
            iconName = 'newspaper';
          } else if (route.name === 'Tarefas') {
            iconName = 'tasks';
          }
            else if (route.name === 'FinagroAI') {
            iconName = 'microchip';
          }
          else if (route.name === 'Fluxo de Caixa') {
            iconName = 'chart-bar';
          }

          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#ebebeb',
        tabBarStyle: {
          backgroundColor: '#208c1c',
          borderTopWidth: 0,
          paddingBottom: 5,
          height: 50,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' },
      })}
    >
      <Tab.Screen 
        name="Notícias" 
        component={Notícias} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="FinagroAI" 
        component={ChatBot} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Início" 
        component={HomeStackNavigator} // Conecta ao Stack Navigator
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Fluxo de Caixa" 
        component={VisãoGeral} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Tarefas" 
        component={Tarefas} 
        options={{ headerShown: false }} 
      />
    </Tab.Navigator>
  );
}
