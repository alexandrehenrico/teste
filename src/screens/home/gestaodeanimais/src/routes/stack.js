import { createStackNavigator } from '@react-navigation/stack';
import AnimalCadastrado from '../screens/AnimalCadastrado';
import DetalhesAnimal from '../screens/DetalhesAnimal';
import { FontAwesome } from '@expo/vector-icons';

const Stack = createStackNavigator();

export default function StackNavigationApp() {
  return (
    <Stack.Navigator initialRouteName='Animais Cadastrados'>
      <Stack.Screen
        name="Animais Cadastrados"
        component={AnimalCadastrado}
        options={{
          title: '', headerTransparent: true, headerShown: false
        }}
      />
      <Stack.Screen
        name="Detalhes Animal"
        component={DetalhesAnimal}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#058301', // Cor de fundo do cabeçalho (verde mais suave)
            height: 90, // Altura levemente menor que a de Animais Cadastrados
            shadowColor: 'transparent', // Remove sombra padrão
          },
          headerTitleStyle: {
            color: '#FFF', // Cor do título
            fontSize: 22, // Tamanho da fonte um pouco menor
            fontWeight: '600', // Deixa o título em negrito
          },
        }}
      />
    </Stack.Navigator>
  );
}
