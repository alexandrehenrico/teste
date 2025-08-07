//AddEditScreen
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

export default function AddEditScreen({ route, navigation, addRecord, editRecord }) {
  const { record, index } = route.params || {};
  const [datainicio, setDatainicio] = useState(record ? new Date(record.datainicio) : new Date());
  const [quant, setQuant] = useState(record?.quant ? String(Number(record.quant)) : '');
  const [peso, setPeso] = useState(record ? record.peso : '');
  const [categoria, setCategoria] = useState(record ? record.categoria : '');
  const [selectedProperty, setSelectedProperty] = useState(record ? record.propertyId : '');
  const [properties, setProperties] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

const loadProperties = async () => {
  try {
    const snapshot = await firestore().collection('propriedades').get();
    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProperties(fetched);
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
  }
};


  const handleSave = async () => {
  if (
    !datainicio || 
    !quant.trim() || 
    !peso.trim() || 
    !categoria.trim() || 
    !selectedProperty || 
    selectedProperty === ''
  ) {
    Alert.alert('Erro', 'Preencha todos os campos corretamente antes de salvar.');
    return;
  }

  const newRecord = {
    datainicio: datainicio.toISOString(),
    quant,
    peso,
    categoria,
    propertyId: selectedProperty,
  };

  try {
    if (record?.id) {
      // Atualizar documento existente
      await firestore()
        .collection('rebanhos')
        .doc(record.id)
        .update(newRecord);
    } else {
      // Criar novo documento
      await firestore()
        .collection('rebanhos')
        .add(newRecord);
    }

    Alert.alert('Sucesso', 'Registro salvo com sucesso!');
    navigation.goBack();
  } catch (error) {
    console.error('Erro ao salvar no Firestore:', error);
    Alert.alert('Erro', 'Não foi possível salvar o registro.');
  }
};


  const parseCurrency = (value) => {
    return Number(value.replace(/\./g, '').replace(',', '.'));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Registro de Lotes</Text>
      </View>

      <Text style={styles.label}>Propriedade</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedProperty}
          onValueChange={(itemValue) => setSelectedProperty(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma propriedade" value="" />
          {properties.map((property, idx) => (
            <Picker.Item key={idx} label={property.name} value={property.name} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Identificação do Lote</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={categoria} onValueChange={(itemValue) => setCategoria(itemValue)} style={styles.picker}>
          <Picker.Item label="Selecione a categoria do lote" value="" />
          <Picker.Item label="01 - Vaca Seca" value="06 - Novilha" />
          <Picker.Item label="02 - Vaca Parida" value="02 - Vaca Parida" />
          <Picker.Item label="03 - Garrote Crescimento" value="03 - Garrote Crescimento" />
          <Picker.Item label="04 - Boi Engorda" value="04 - Boi Engorda" />
          <Picker.Item label="05 - Bezerra" value="05 - Bezerra" />
          <Picker.Item label="06 - Novilha" value="06 - Novilha" />
        </Picker>
      </View>

      <Text style={styles.label}>Data de Início</Text>
<TouchableOpacity onPress={() => setShowDatePicker(true)}>
  <TextInput
    style={styles.input}
    placeholder="Informe a data de início"
    editable={false}
    value={datainicio.toLocaleDateString('pt-BR')}
  />
</TouchableOpacity>
{showDatePicker && (
  <View>
    <DateTimePicker
      value={datainicio}
      mode="date"
      display="default"
      onChange={(event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setDatainicio(selectedDate);
      }}
    />
  </View>
)}

      <Text style={styles.label}>Quantidade de Animais</Text>
      <TextInput style={styles.input} placeholder="Informe a quantidade de animais" keyboardType="numeric" value={quant} onChangeText={setQuant} />

      <Text style={styles.label}>Peso Bruto (Kg)</Text>
      <TextInput style={styles.input} placeholder="Informe o peso bruto em Kg" value={peso} keyboardType="numeric" onChangeText={setPeso} />


      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  titleContainer: {
    backgroundColor: '#058301',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    color: '#404040',
    fontSize: 15,
    fontWeight: 'bold',
  },
  input: {
    height: 42,
    backgroundColor: '#FFF',
    borderBottomWidth: 1.5,
    borderColor: '#556b2f',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    marginVertical: 5,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderColor: '#556b2f',
    borderWidth: 1.5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#058301',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#c41616',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
