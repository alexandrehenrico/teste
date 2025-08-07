import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { FontAwesome } from '@expo/vector-icons';

export default function PropertyDetailsScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [animalCount, setAnimalCount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalLaborCost, setTotalLaborCost] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const { property } = route.params;
  
  useEffect(() => {
    if (property) {
      fetchAnimalCount();
      fetchTotalExpenses();
      fetchTotalLaborCost();
      fetchTotalIncome();
    }
  }, [property]);

const fetchAnimalCount = async () => {
  try {
    const currentUser = auth().currentUser;
    const snapshot = await firestore()
      .collection('animais')
      .where('property', '==', property.name)
      .where('userId', '==', currentUser.uid)
      .get();

    setAnimalCount(snapshot.size);
  } catch (error) {
    console.error('Erro ao carregar dados dos animais:', error);
    Alert.alert('Erro', 'Não foi possível carregar os dados dos animais.');
  }
};


 const fetchTotalExpenses = async () => {
  try {
    const currentUser = auth().currentUser;
    const snapshot = await firestore()
      .collection('despesas')
      .where('property', '==', property.name)
      .where('userId', '==', currentUser.uid)
      .get();

    const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().valor || 0), 0);
    setTotalExpenses(total);
  } catch (error) {
    console.error('Erro ao carregar despesas:', error);
    Alert.alert('Erro', 'Não foi possível carregar as despesas.');
  }
};


const fetchTotalLaborCost = async () => {
  try {
    const currentUser = auth().currentUser;
    const snapshot = await firestore()
      .collection('maodeobra')
      .where('property', '==', property.name)
      .where('userId', '==', currentUser.uid)
      .get();

    const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().valor || 0), 0);
    setTotalLaborCost(total);
  } catch (error) {
    console.error('Erro ao carregar mão de obra:', error);
    Alert.alert('Erro', 'Não foi possível carregar os dados de mão de obra.');
  }
};

  
  
const fetchTotalIncome = async () => {
  try {
    const currentUser = auth().currentUser;
    const snapshot = await firestore()
      .collection('receitas')
      .where('propertyId', '==', property.name)
      .where('userId', '==', currentUser.uid)
      .get();

    const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().valor || 0), 0);
    setTotalIncome(total);
  } catch (error) {
    console.error('Erro ao carregar receitas:', error);
    Alert.alert('Erro', 'Não foi possível carregar as receitas.');
  }
};


  if (!property) {
    Alert.alert('Erro', 'Propriedade não encontrada!');
    navigation.goBack();
    return null;
  }

  const formatCurrency = (value) => {
    const num = Number(value); // Converte para número caso seja string
    if (isNaN(num)) return "R$ 0,00"; // Evita erros caso o valor seja inválido
  
    return num.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const handleDetailsPress = (sectionName) => {
    switch (sectionName) {
      case 'Rebanho':
        navigation.navigate('Gestão de Animais');
        break;
      case 'Despesas':
        navigation.navigate('Despesas');
        break;
      case 'Mão de Obra':
        navigation.navigate('Mão De Obra');
        break;
      case 'Receitas':
        navigation.navigate('Receitas');
        break;
      default:
        Alert.alert('Seção não encontrada!');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#058301" />
      </View>
    );
  }


  const logAllKeysToDevice = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.warn('Keys registradas no AsyncStorage:', keys); // Exibe o log no dispositivo.
    } catch (error) {
      console.warn('Erro ao obter as keys do AsyncStorage:', error); // Também exibe erros no dispositivo.
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerText}>Detalhes da Propriedade</Text>
    </View>

      <View style={styles.infoCard}>
        <Text style={styles.propertyName} numberOfLines={1}>
          {property.name}
        </Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {property.city}
        </Text>
        <Text style={styles.area} numberOfLines={1}>
          {property.area} hectares </Text>
      </View>

      <View style={styles.sectionContainer}>
        <Section
          title="Rebanho"
          value={`${animalCount} Animais`}
          onPress={() => handleDetailsPress('Rebanho')}
        />
        <Section 
         title="Despesas"
         value={formatCurrency(totalExpenses)}
         onPress={() => handleDetailsPress('Despesas')}
        />
        <Section
          title="Mão de Obra"
          value={formatCurrency(totalLaborCost)}
          onPress={() => handleDetailsPress('Mão de Obra')}
        />
        <Section
          title="Receitas"
          value={formatCurrency(totalIncome)}
          onPress={() => handleDetailsPress('Receitas')}
        />
      </View>
    </ScrollView>
  );
}

const Section = ({ icon, title, value, onPress }) => (
  <View style={styles.section}>
    <View style={styles.sectionLeft}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.sectionInfo}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionValue}>{value}</Text>
      </View>
    </View>
    <TouchableOpacity onPress={onPress} style={styles.detailsButton}>
      <Text style={styles.detailsButtonText}>Detalhes</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
    paddingBottom: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',},
  header: {
    backgroundColor: '#058301',
    paddingVertical: 15,
    paddingHorizontal: 10,
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
  infoCard: {
    backgroundColor: '#f9f9f9',
    marginTop: 20,
    margin: 15,
    alignItems: 'center',
  },
  propertyName: {
    fontSize: 30,
    fontWeight: 900,
    color: '#555',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  sectionContainer: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  section: {
      backgroundColor: '#f9f9f9',
      borderColor: '#999',
      borderWidth: 1, // Adiciona a borda
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 8,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',  
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionInfo: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: '#555',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  detailsButton: {
    backgroundColor: '#d7d9d7',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  detailsButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '900',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  area: {
    fontSize: 22,
    fontWeight: 900,
    color: '#555',
    marginBottom: 4,
  },
});
