import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import { useData } from '../../DataContext';

export default function HomeScreen({ navigation, route }) {
  const [properties, setProperties] = useState([]);
  const [summary, setSummary] = useState({ totalProperties: 0, totalArea: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { properties: globalProperties } = useData();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadProperties);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (route.params?.updated) {
      loadProperties();
      navigation.setParams({ updated: false }); // Reseta o parâmetro
    }
  }, [route.params?.updated]);
    

const loadProperties = async () => {
  setIsLoading(true);
  try {
    const currentUser = auth().currentUser;
    const propertySnapshot = await firestore()
      .collection('propriedades')
      .where('userId', '==', currentUser.uid)
      .get();

    const propertyList = propertySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const animalsSnapshot = await firestore()
      .collection('animais')
      .where('userId', '==', currentUser.uid)
      .get();

    const animals = animalsSnapshot.docs.map(doc => doc.data());

    const propertiesWithAnimalCount = propertyList.map(property => {
      const animalCount = animals.filter(animal => animal.property === property.name).length;
      return { ...property, animalCount };
    });

    setProperties(propertiesWithAnimalCount);
    calculateSummary(propertiesWithAnimalCount);
  } catch (error) {
    console.error('Erro ao carregar propriedades:', error);
    Alert.alert('Erro', 'Não foi possível carregar as propriedades');
  } finally {
    setIsLoading(false);
  }
};

  const calculateSummary = (propertiesList) => {
    const totalProperties = propertiesList.length;
    const totalArea = propertiesList.reduce(
      (sum, property) => sum + (parseFloat(property.area) || 0),
      0
    );

    setSummary({
      totalProperties,
      totalArea: totalArea.toLocaleString('pt-BR', { minimumFractionDigits: 0 }),
    });
  };

  const editProperty = (property, index) => {
    navigation.navigate('AddProperty', { property, index, refresh: loadProperties });
  };
  
  const deleteProperty = (property) => {
    Alert.alert(
      'Confirmação',
      `Deseja excluir a propriedade "${property.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
  try {
    await firestore().collection('propriedades').doc(property.id).delete();
    const updatedProperties = properties.filter(p => p.id !== property.id);
    setProperties(updatedProperties);
    calculateSummary(updatedProperties);
  } catch (error) {
    console.error('Erro ao excluir propriedade:', error);
    Alert.alert('Erro', 'Não foi possível excluir a propriedade');
  }
          },
        },
      ]
    );
  };

  const viewPropertyDetails = (property) => {
    navigation.navigate('PropertyDetails', { property, animalCount: property.animalCount });
  };

  const renderPropertyItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.details}>Gerente: {item.manager}</Text>
        <Text style={styles.details}>
          {`${Number(item.animalCount).toLocaleString('pt-BR')} Animais`}
        </Text>
        <Text style={styles.details}>Área: {Number(item.area).toLocaleString('pt-BR')} Ha</Text>
        <Text style={styles.details}>Município: {item.city}</Text>
        <Text style={styles.details}>Valor Estimado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
        </Text>

      </View>

      <View style={styles.icons}>
        <TouchableOpacity
          style={[styles.iconButton, styles.infoButton]}
          onPress={() => viewPropertyDetails(item)}
        >
          <Icon name="info" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.editButton]}
          onPress={() => editProperty(item)}
        >
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={() => deleteProperty(item)}
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

  <View style={styles.header}>    
            <Text style={styles.headerText}>Minhas Propriedades</Text>
        <TouchableOpacity style={styles.addButtonHeader}
        onPress={() => navigation.navigate('AddProperty', { refresh: loadProperties })}>
                <FontAwesome name="plus" size={24} color="#058301" />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Icon name="home" size={24} color="#fff" />
          <Text style={styles.summaryText}>
            Total de Propriedades: <Text style={styles.summaryValue}>{summary.totalProperties}</Text>
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Icon name="map" size={24} color="#fff" />
          <Text style={styles.summaryText}>
            Área Total: <Text style={styles.summaryValue}>{summary.totalArea} Ha</Text>
          </Text>
        </View>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderPropertyItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>Nenhuma propriedade cadastrada ainda.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9F9F9' 
  },

  header: {
    backgroundColor: '#058301',
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  headerText: { 
    fontSize: 22, 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  addButtonHeader: {
    backgroundColor: '#fff',
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    backgroundColor: '#058301',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },

  summaryRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },

  summaryText: { 
    fontSize: 16, 
    marginLeft: 10, 
    color: '#fff' 
  },

  summaryValue: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },

  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardContent: { 
    flex: 1 
  },

  title: { 
    fontSize: 18,
    fontWeight: 900,
    color: '#555',
    marginBottom: 4,
  },
  details: { 
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  icons: { 
    flexDirection: 'column', 
    marginLeft: 10 
  },
  iconButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 8, // Substitui gap para compatibilidade
  },

  editButton: { 
    backgroundColor: '#058301' 
  },

  deleteButton: { 
    backgroundColor: '#f44336' 
  },

  infoButton: { 
    backgroundColor: '#2196f3' 
  },

  emptyListContainer: { 
    alignItems: 'center', 
    marginTop: 50 
  },

  emptyListText: { 
    fontSize: 16, 
    color: '#757575', 
    marginTop: 10 
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: { 
    marginTop: 10, 
    color: '#fff', 
    fontSize: 16 
  },
});
