import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import ListScreen from '../../screens/home/Rebanho em lote/ListScreen';
import AddEditScreen from '../../screens/home/Rebanho em lote/AddEditScreen';
import DetailScreen from '../../screens/home/Rebanho em lote/DetailScreen';
import { useData } from '../../screens/home/DataContext';

const Stack = createStackNavigator();
const collectionRef = firestore().collection('rebanho_em_lote');

export default function RebanhoEmLoteNavigator() {
  const { rebanhoRecords, setRebanhoRecords } = useData();

  // 🔄 Carregar registros do Firestore ao abrir
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const snapshot = await collectionRef.get();
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRebanhoRecords(records);
      } catch (error) {
        console.error('Erro ao buscar dados do rebanho:', error);
      }
    };

    loadRecords();
  }, []);

  // ➕ Adicionar novo registro
  const addRecord = async (record) => {
    try {
      await collectionRef.add(record);
      const updatedSnapshot = await collectionRef.get();
      setRebanhoRecords(updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao adicionar registro do rebanho:', error);
    }
  };

  // ✏️ Editar registro
  const editRecord = async (id, updatedRecord) => {
    try {
      await collectionRef.doc(id).update(updatedRecord);
      const updatedSnapshot = await collectionRef.get();
      setRebanhoRecords(updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao editar registro do rebanho:', error);
    }
  };

  // ❌ Excluir registro
  const deleteRecord = async (id) => {
    try {
      await collectionRef.doc(id).delete();
      const updatedSnapshot = await collectionRef.get();
      setRebanhoRecords(updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao excluir registro do rebanho:', error);
    }
  };

  return (
    <Stack.Navigator initialRouteName="List">
      <Stack.Screen
        name="List"
        options={{ title: '', headerTransparent: true, headerShown: false }}
      >
        {(props) => (
          <ListScreen
            {...props}
            records={rebanhoRecords}
            setRecords={setRebanhoRecords}
            deleteRecord={deleteRecord}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="AddEdit"
        options={{ title: '', headerTransparent: true, headerShown: false }}
      >
        {(props) => (
          <AddEditScreen
            {...props}
            addRecord={addRecord}
            editRecord={editRecord}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="DetailScreen"
        component={DetailScreen}
        options={{ title: '', headerTransparent: true, headerShown: false }}
      />
    </Stack.Navigator>
  );
}
