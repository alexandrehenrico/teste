import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Para o dropdown
import firestore from '@react-native-firebase/firestore';
import { useData } from '../DataContext';

  const { record, index } = route.params || {};

  const loadProperties = async () => {
  try {
    const snapshot = await firestore().collection('propriedades').get();
    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProperties(fetched);
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
  }
};


  const handleSave = () => {
  if (
    !data || 
    !origem.trim() || 
    !valor.trim() || 
    isNaN(parseCurrency(valor)) ||
    !pagador.trim() || 
    !data2 || 
    !pagamento.trim() || 
    !selectedProperty
  ) {
    Alert.alert('Erro', 'Preencha todos os campos corretamente antes de salvar.');
    return;
  }

  const receita = {
    data: data.toISOString(),
    origem,
    valor: parseCurrency(valor),
    pagador,
    data2: data2.toISOString(),
    pagamento,
    propertyId: selectedProperty,
  };

  if (record?.id) {
    // Editar receita existente
    firestore()
      .collection('receitas')
      .doc(record.id)
      .update(receita)
      .then(() => navigation.goBack())
      .catch(() => Alert.alert('Erro', 'Falha ao editar a receita.'));
  } else {
    // Adicionar nova receita
    firestore()
      .collection('receitas')
      .add(receita)
      .then(() => navigation.goBack())
      .catch(() => Alert.alert('Erro', 'Falha ao salvar a receita.'));
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

  const showDatePickerHandler2 = () => {
    setShowDatePicker2(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setData(selectedDate);
    }
  };

  const handleDateChange2 = (event, selectedDate) => {
    setShowDatePicker2(false);
    if (selectedDate) {
      setData2(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Registro de Receitas</Text>
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

      <Text style={styles.label}>Data da Venda</Text>
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

      <Text style={styles.label}>Origem da Venda</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe a origem da venda"
        placeholderTextColor="#B3B3B3"
        value={origem}
        onChangeText={setOrigem}
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe o valor"
        placeholderTextColor="#B3B3B3"
        keyboardType="numeric"
        value={valor}
        onChangeText={handleValorChange}
      />

      <Text style={styles.label}>Pagador</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe o pagador"
        placeholderTextColor="#B3B3B3"
        value={pagador}
        onChangeText={setPagador}
      />

      <Text style={styles.label}>Data do Pagamento</Text>
      <TouchableOpacity onPress={showDatePickerHandler2}>
        <TextInput
          style={styles.input}
          placeholder="Informe a data"
          placeholderTextColor="#B3B3B3"
          editable={false}
          value={data2.toLocaleDateString('pt-BR')}
        />
      </TouchableOpacity>

      {showDatePicker2 && (
        <DateTimePicker
          value={data2}
          mode="date"
          display="default"
          onChange={handleDateChange2}
        />
      )}

      <Text style={styles.label}>Forma de Pagamento</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe a forma de pagamento"
        placeholderTextColor="#B3B3B3"
        value={pagamento}
        onChangeText={setPagamento}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
