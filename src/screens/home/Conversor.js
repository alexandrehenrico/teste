import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Conversor() {
  const [inputValue, setInputValue] = useState('');
  const [inputUnit, setInputUnit] = useState('m');
  const [outputUnit, setOutputUnit] = useState('cm');
  const [result, setResult] = useState(null);

  const units = {
    // Área
    m2: { label: 'Metro quadrado (m²)', value: 1 },
    ha: { label: 'Hectare (ha)', value: 10000 },
    km2: { label: 'Quilômetro quadrado (km²)', value: 1000000 },
    acre: { label: 'Acre', value: 4046.86 },
    alqueire: { label: 'Alqueire (médio)', value: 24200 },
    sqfeet: { label: 'Pé quadrado (ft²)', value: 0.092903 },
    sqyard: { label: 'Jarda quadrada (yd²)', value: 0.836127 },
    sqmile: { label: 'Milha quadrada (mi²)', value: 2589988.11 },
    braca: { label: 'Braça', value: 2.25 },
    legua: { label: 'Légua', value: 6600000 },

    // Extensão
    m: { label: 'Metro (m)', value: 1 },
    cm: { label: 'Centímetro (cm)', value: 0.01 },
    mm: { label: 'Milímetro (mm)', value: 0.001 },
    km: { label: 'Quilômetro (km)', value: 1000 },
    inch: { label: 'Polegada (in)', value: 0.0254 },
    foot: { label: 'Pé (ft)', value: 0.3048 },
    yard: { label: 'Jarda (yd)', value: 0.9144 },
    mile: { label: 'Milha (mi)', value: 1609.34 },

    // Peso
    kg: { label: 'Quilograma (kg)', value: 1 },
    g: { label: 'Grama (g)', value: 0.001 },
    ton: { label: 'Tonelada (t)', value: 1000 },
    arroba: { label: 'Arroba (15kg)', value: 15 },
    saca: { label: 'Saca (60kg)', value: 60 },
    lb: { label: 'Libra (lb)', value: 0.453592 },
    oz: { label: 'Onça (oz)', value: 0.0283495 },
  };

  const convert = () => {
    const inputNumber = parseFloat(inputValue.replace(',', '.'));
    if (isNaN(inputNumber)) {
      Alert.alert('Erro', 'Por favor, insira um valor numérico válido.');
      return;
    }

    const valueInBaseUnit = inputNumber * units[inputUnit].value;
    const convertedValue = valueInBaseUnit / units[outputUnit].value;

    setResult(convertedValue);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Conversor de Medidas</Text>

      <Text style={styles.description}>
        Converta medidas de área, extensão e peso de forma simples e rápida.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o valor"
        keyboardType="numeric"
        value={inputValue}
        onChangeText={setInputValue}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>De:</Text>
        <Picker
          selectedValue={inputUnit}
          style={styles.picker}
          onValueChange={(itemValue) => setInputUnit(itemValue)}
        >
          {Object.keys(units).map((unit) => (
            <Picker.Item key={unit} label={units[unit].label} value={unit} />
          ))}
        </Picker>

        <Text style={styles.label}>Para:</Text>
        <Picker
          selectedValue={outputUnit}
          style={styles.picker}
          onValueChange={(itemValue) => setOutputUnit(itemValue)}
        >
          {Object.keys(units).map((unit) => (
            <Picker.Item key={unit} label={units[unit].label} value={unit} />
          ))}
        </Picker>
      </View>

      <Button title="Converter" onPress={convert} color="#058301" />

      {result !== null && (
        <Text style={styles.result}>
          Resultado: {result.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })} {units[outputUnit].label}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#058301',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
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
    marginVertical: 5
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    margintop: 8,
    color: '#404040',
    fontSize: 15,
    fontWeight: 'bold',
  },
  picker: {
    height: 55,
    width: '100%',
    backgroundColor: '#FFF',
    borderBottomWidth: 1.5,
    borderColor: '#556b2f',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    marginVertical: 5
  },
  result: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 25,
    backgroundColor: '#058301'
  },
});