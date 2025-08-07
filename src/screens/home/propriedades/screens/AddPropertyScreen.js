import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import styles from '../../../home/propriedades/screens/AddPropertyScreen.style.js';
import { useData } from '../../DataContext';


export default function AddPropertyScreen({ navigation, route }) {
  const { property, index, refresh } = route.params || {};
  const { setProperties } = useData();

  const [form, setForm] = useState({
    name: '',
    manager: '',
    area: '',
    city: '',
    valor: '',

  });

  useEffect(() => {
    if (property) setForm(property); // Preenche os campos se estiver editando
  }, [property]);

  // Manipula as mudanças de entrada nos campos
  const handleInputChange = (key, value) => {
    if (key === 'area') {
      const numericValue = value.replace(/[^0-9.]/g, ''); // Permite apenas números
      setForm({ ...form, [key]: numericValue });
    } else {
      setForm({ ...form, [key]: value });
    }
  };

  // Salva ou edita uma propriedade
const saveProperty = async () => {
  const { name, manager, area, city, valor } = form;

  if (!name || !manager || !area || !city || !valor) {
    Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const areaValue = parseFloat(area);
  if (isNaN(areaValue) || areaValue <= 0) {
    Alert.alert('Erro', 'A área deve ser um número positivo válido.');
    return;
  }

  try {
    const currentUser = auth().currentUser;

    const newData = {
      name,
      manager,
      area: areaValue,
      city,
      valor,
      userId: currentUser.uid,
    };

    if (property && property.id) {
      await firestore().collection('propriedades').doc(property.id).update(newData);
    } else {
      await firestore().collection('propriedades').add(newData);
    }

    if (refresh) await refresh(); // atualiza a lista na Home
    navigation.navigate('Home', { updated: true });
  } catch (error) {
    console.error('Erro ao salvar propriedade:', error);
    Alert.alert('Erro', 'Não foi possível salvar a propriedade.');
  }
};


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Container do Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {property ? 'Editar Propriedade' : 'Adicionar Propriedade'}
          </Text>
        </View>

        <Text style={styles.label}>Nome da Propriedade</Text>
        <TextInput
          placeholder="Informe o nome"
          placeholderTextColor="#B3B3B3"
          style={styles.input}
          value={form.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />

        <Text style={styles.label}>Gerente</Text>
        <TextInput
          placeholder="Informe o nome do gerente"
          placeholderTextColor="#B3B3B3"
          style={styles.input}
          value={form.manager}
          onChangeText={(value) => handleInputChange('manager', value)}
        />

        <Text style={styles.label}>Área da Propriedade (Ha)</Text>
        <TextInput
          placeholder="Informe a área em hectares"
          placeholderTextColor="#B3B3B3"
          style={styles.input}
          keyboardType="numeric"
          value={form.area}
          onChangeText={(value) => handleInputChange('area', value)}
        />

        <Text style={styles.label}>Município</Text>
        <TextInput
          placeholder="Informe o município"
          placeholderTextColor="#B3B3B3"
          style={styles.input}
          value={form.city}
          onChangeText={(value) => handleInputChange('city', value)}
        />

        <Text style={styles.label}>Valor Estimado</Text>
        <TextInput
          placeholder="Informe o valor (R$)"
          placeholderTextColor="#B3B3B3"
          style={styles.input}
          keyboardType="numeric"
          value={form.valor}
          onChangeText={(value) => handleInputChange("valor", value)}  
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveProperty}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

