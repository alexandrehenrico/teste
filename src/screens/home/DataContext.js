import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [receitasRecords, setReceitasRecords] = useState([]);
  const [maoDeObraRecords, setMaoDeObraRecords] = useState([]);
  const [despesasRecords, setDespesasRecords] = useState([]);
  const [rebanhoRecords, setRebanhoRecords] = useState([]); // 👈 adicionado
  const [properties, setProperties] = useState([]); // 👈 adicionado para propriedades
  const [isLoading, setIsLoading] = useState(true);

  // Carregar propriedades do Firestore em tempo real
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('propriedades')
      .where('userId', '==', currentUser.uid)
      .onSnapshot(
        snapshot => {
          const propertiesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProperties(propertiesList);
        },
        error => {
          console.error('Erro ao carregar propriedades:', error);
        }
      );

    return () => unsubscribe();
  }, []);
  const loadDataFromStorage = async () => {
    try {
      const savedMaoDeObra = await AsyncStorage.getItem('@maodeobra_records');
      const savedReceitas = await AsyncStorage.getItem('@receitas');
      const savedDespesas = await AsyncStorage.getItem('@despesas');

      if (savedMaoDeObra) setMaoDeObraRecords(JSON.parse(savedMaoDeObra));
      if (savedReceitas) setReceitasRecords(JSON.parse(savedReceitas));
      if (savedDespesas) setDespesasRecords(JSON.parse(savedDespesas));
    } catch (error) {
      console.error('Erro ao carregar registros do AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromStorage();
  }, []);

  return (
    <DataContext.Provider
      value={{
        receitasRecords,
        setReceitasRecords,
        maoDeObraRecords,
        setMaoDeObraRecords,
        despesasRecords,
        setDespesasRecords,
        rebanhoRecords,           // 👈 adicionado
        setRebanhoRecords,        // 👈 adicionado
        properties,               // 👈 adicionado
        setProperties,            // 👈 adicionado
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
