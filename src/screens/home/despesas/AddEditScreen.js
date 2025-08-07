import React, { useState, useEffect } from 'react'; 
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Adicione essa biblioteca no projeto
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useData } from '../DataContext';

export default function AddEditScreen({ route, navigation, addRecord, editRecord }) {
  const { record, index } = route.params || {};
  const { properties } = useData();
  const [selectedProperty, setSelectedProperty] = useState(record ? record.property : null);
  const [descricao, setDescricao] = useState(record ? record.descricao : '');
  const [valor, setValor] = useState(record ? record.valor.toFixed(2).replace('.', ',') : '');
  const [data, setData] = useState(record ? new Date(record.data) : new Date());
  const [formaPagamento, setFormaPagamento] = useState(record ? record.formaPagamento : '');
  const [showDatePicker, setShowDatePicker] = useState(false);


const handleSave = async () => {
  if (!descricao || !valor || !data || !formaPagamento || !selectedProperty) {
    Alert.alert('Erro', 'Preencha todos os campos antes de salvar.');
    return;
  }

  const currentUser = auth().currentUser;
  if (!currentUser) {
    Alert.alert('Erro', 'Usuário não autenticado.');
    return;
  }

  const newRecord = {
    property: typeof selectedProperty === 'object' ? selectedProperty.name : selectedProperty,
    descricao,
    valor: parseCurrency(valor),
    data: firestore.Timestamp.fromDate(data),
    formaPagamento,
    owner: currentUser.uid,
  };

  try {
    if (record && record.id) {
      await firestore().collection('despesas').doc(record.id).update(newRecord);
      Alert.alert('Sucesso', 'Despesa atualizada com sucesso!');
    } else {
      await firestore().collection('despesas').add(newRecord);
      Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
    }
    navigation.goBack();
  } catch (error) {
    console.error("Erro ao salvar despesa: ", error);
    Alert.alert('Erro', 'Não foi possível salvar a despesa.');
  }
};


  const parseCurrency = (value) => {
    return Number(value.replace(/\./g, '').replace(',', '.'));
  };

  const formatCurrency = (text) => {
    const onlyNumbers = text.replace(/[^0-9]/g, '');
    const integerPart = onlyNumbers.slice(0, -2) || '0';
    const decimalPart = onlyNumbers.slice(-2).padStart(2, '0');
    return `${parseInt(integerPart, 10).toLocaleString('pt-BR')},${decimalPart}`;
  };

  const handleValorChange = (text) => {
    setValor(formatCurrency(text));
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setData(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Registro de Despesas</Text>

      <Text style={styles.label}>Propriedade</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedProperty}
          onValueChange={(itemValue) => setSelectedProperty(itemValue)}
        >
          <Picker.Item label="Selecione uma propriedade" value={null} />
          {properties.map((property, idx) => (
          <Picker.Item key={idx} label={property.name} value={property.name} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe a descrição"
        placeholderTextColor="#B3B3B3"
        value={descricao}
        onChangeText={setDescricao}
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe o valor do serviço"
        placeholderTextColor="#B3B3B3"
        keyboardType="numeric"
        value={valor}
        onChangeText={handleValorChange}
      />

      <Text style={styles.label}>Forma de Pagamento</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe a forma de pagamento"
        placeholderTextColor="#B3B3B3"
        value={formaPagamento}
        onChangeText={setFormaPagamento}
      />

      <Text style={styles.label}>Data</Text>
      <TouchableOpacity onPress={showDatePickerHandler}>
        <TextInput
          style={styles.input}
          placeholder="Informe a data"
          placeholderTextColor="#B3B3B3"
          editable={false}
          value={data.toLocaleDateString('pt-BR')}
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

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
  // Mesmo estilo existente
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#058301',
    textAlign: 'center',
    padding: 10,
    marginBottom: 30,
    borderRadius: 8,
  },
  label: {
    marginBottom: 8,
    margintop: 8,
    color: '#404040',
    fontSize: 15,
    fontWeight: 'bold',
  },
  input: {
    height: 42,
    width: '100%',
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
    borderWidth: 1,
    borderColor: '#556b2f',
    borderRadius: 6,
    marginVertical: 5,
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
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#c41616',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
