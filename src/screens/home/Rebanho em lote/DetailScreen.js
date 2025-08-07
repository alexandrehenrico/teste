import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import styles from './DetailScreen.styles.js';

export default function DetailScreen({ route }) {
  const record = route?.params?.record ?? {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatValue = (value, suffix = '') => 
    value ? `${Number(value).toLocaleString('pt-BR')}${suffix}` : 'N/A';


  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.headerText} accessibilityRole="header">
          Lotes de Animais
        </Text>
      </View>
  <Text style={styles.title}>Lote {record.categoria ?? 'Sem Categoria'}</Text>
  <Text style={styles.subtitle}>{record.propertyId ?? 'Sem ID'}</Text>
      <View>
        <Text style={styles.label} accessibilityLabel="Quantidade de Animais">
          Quantidade de Animais
        </Text>
        <Text style={styles.input}>{formatValue(record.quant)}</Text>
      </View>

      <View>
        <Text style={styles.label} accessibilityLabel="Peso Bruto">
          Peso Bruto
        </Text>
        <Text style={styles.input}>{formatValue(record.peso, ' kg')}</Text>
      </View>
    </ScrollView>
  );
}
