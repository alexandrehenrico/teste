import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListScreen from '../../screens/home/receitas/ListScreen';
import AddEditScreen from '../../screens/home/receitas/AddEditScreen';
import DetailScreen from '../../screens/home/receitas/DetailScreen';
import { useData } from '../../screens/home/DataContext'; // Importe o contexto

const Stack = createStackNavigator();
const STORAGE_KEY = '@receitas';

export default function ReceitasNavigator() {
  const { receitasRecords, setReceitasRecords } = useData(); // Conecta ao contexto

  // Função para carregar registros do AsyncStorage
  const loadRecords = async () => {
    try {
      const savedRecords = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedRecords) {
        setReceitasRecords(JSON.parse(savedRecords)); // Atualiza o contexto
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  // Função para salvar registros no AsyncStorage
  const saveRecords = async (newRecords) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (error) {
      console.error('Erro ao salvar registros:', error);
    }
  };

  // Carregar registros ao inicializar
  useEffect(() => {
    loadRecords();
  }, []);

  const addRecord = (record) => {
    const newRecords = [...receitasRecords, record];
    setReceitasRecords(newRecords); // Atualiza o contexto
    saveRecords(newRecords); // Atualiza o AsyncStorage
  };

  const editRecord = (index, updatedRecord) => {
    const updatedRecords = [...receitasRecords];
    updatedRecords[index] = updatedRecord;
    setReceitasRecords(updatedRecords); // Atualiza o contexto
    saveRecords(updatedRecords); // Atualiza o AsyncStorage
  };

  const deleteRecord = (index) => {
    const updatedRecords = receitasRecords.filter((_, i) => i !== index);
    setReceitasRecords(updatedRecords); // Atualiza o contexto
    saveRecords(updatedRecords); // Atualiza o AsyncStorage
  };

  return (
    <Stack.Navigator initialRouteName="List">
      <Stack.Screen name="List" options={{ title: '', headerTransparent: true, headerShown: false}}>
        {(props) => (
          <ListScreen
            {...props}
            records={receitasRecords}
            setRecords={setReceitasRecords}
            deleteRecord={deleteRecord}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AddEdit" options={{title: '', headerTransparent: true, headerShown: false}}>
        {(props) => (
          <AddEditScreen
            {...props}
            addRecord={addRecord}
            editRecord={editRecord}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="DetailScreen" component={DetailScreen} options={{ title: '', headerTransparent: true, headerShown: false}} />
    </Stack.Navigator>
  );
}
