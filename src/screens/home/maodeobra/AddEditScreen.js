import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import { useData } from '../DataContext';

export default function AddEditScreen({ route, navigation, addRecord, editRecord }) {
  const { record, index } = route.params || {};
  const { properties } = useData();
  const [nome, setNome] = useState(record ? record.nome : '');
  const [descricao, setDescricao] = useState(record ? record.descricao : '');
  const [valor, setValor] = useState(record ? record.valor.toFixed(2).replace('.', ',') : '');
  const [data, setData] = useState(record ? new Date(record.data) : new Date());
  const [formaPagamento, setFormaPagamento] = useState(record ? record.formaPagamento : '');
  const [selectedProperty, setSelectedProperty] = useState(record ? record.property : '');
  const [showDatePicker, setShowDatePicker] = useState(false);


  const handleSave = () => {
    if (!nome || !valor || !data || !formaPagamento || !descricao || !selectedProperty ) {
      Alert.alert('Erro', 'Preencha todos os campos antes de salvar.');
      return;
    }

    const newRecord = {
      nome,
      descricao,
      valor: parseCurrency(valor),
      data: data.toISOString(),
      formaPagamento,
      property: selectedProperty,
    };

    if (record) {
  // Editar
  firestore()
    .collection('maoDeObra')
    .doc(record.id)
    .update(newRecord)
    .then(() => navigation.goBack())
    .catch(() => Alert.alert('Erro', 'Falha ao editar registro.'));
} else {
  // Adicionar
  // Adicionar mão de obra dentro da subcoleção da propriedade selecionada
      firestore()
        .collection('maoDeObra')
        .add(newRecord)
        .then(() => navigation.goBack())
        .catch(() => Alert.alert('Erro', 'Falha ao salvar registro.'));
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Registro de Mão de Obra</Text>
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
          <Picker.Item key={idx} label={property.name} value={property.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Nome do Funcionário</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe o nome do funcionário"
        placeholderTextColor="#B3B3B3"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe a descrição"
        placeholderTextColor="#B3B3B3"
        value={descricao}
        onChangeText={setDescricao}
      />

      <Text style={styles.label}>Valor do Serviço (R$)</Text>
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
  pickerContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#556b2f',
    borderRadius: 6,
    marginVertical: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  header: {
    backgroundColor: '#058301',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderColor: '#058301',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 15,
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
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
