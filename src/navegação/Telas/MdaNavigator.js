import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListScreen from '../../screens/home/maodeobra/ListScreen';
import AddEditScreen from '../../screens/home/maodeobra/AddEditScreen';
import DetailScreen from '../../screens/home/maodeobra/DetailScreen';
import { useData } from '../../screens/home/DataContext';

const Stack = createStackNavigator();
const STORAGE_KEY = '@maodeobra_records';

export default function MaoDeObraNavigator() {
  const { maoDeObraRecords, setMaoDeObraRecords } = useData();

  // Função para carregar registros do AsyncStorage
  const loadRecords = async () => {
    try {
      const savedRecords = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedRecords) {
        setMaoDeObraRecords(JSON.parse(savedRecords)); // Atualiza o contexto
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
    const newRecords = [...maoDeObraRecords, record];
    setMaoDeObraRecords(newRecords); // Atualiza o contexto
    saveRecords(newRecords); // Atualiza o AsyncStorage
  };

  const editRecord = (index, updatedRecord) => {
    const updatedRecords = [...maoDeObraRecords];
    updatedRecords[index] = updatedRecord;
    setMaoDeObraRecords(updatedRecords); // Atualiza o contexto
    saveRecords(updatedRecords); // Atualiza o AsyncStorage
  };

  const deleteRecord = (index) => {
    const updatedRecords = maoDeObraRecords.filter((_, i) => i !== index);
    setMaoDeObraRecords(updatedRecords); // Atualiza o contexto
    saveRecords(updatedRecords); // Atualiza o AsyncStorage
  };

  return (
    <Stack.Navigator initialRouteName="List">
      <Stack.Screen name="List" options={{ title: '', headerTransparent: true, headerShown: false}}>
        {(props) => (
          <ListScreen
            {...props}
            records={maoDeObraRecords}
            setRecords={setMaoDeObraRecords}
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
