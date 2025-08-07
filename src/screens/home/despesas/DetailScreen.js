import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DetailScreen({ route }) {
  const { record } = route.params;

  const formatDate = (data) => {
    const date = data instanceof Date ? data : new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes da Despesa</Text>

      <View style={styles.detailBox}>
        <Text style={styles.label}>Descrição</Text>
        <Text style={styles.value}>{record.descricao}</Text>
      </View>

      <View style={styles.detailBox}>
        <Text style={styles.label}>Valor</Text>
        <Text style={styles.value}>
          R$ {parseFloat(record.valor).toFixed(2).replace('.', ',')}
        </Text>
      </View>

      <View style={styles.detailBox}>
        <Text style={styles.label}>Forma de Pagamento</Text>
        <Text style={styles.value}>{record.formaPagamento}</Text>
      </View>

      <View style={styles.detailBox}>
        <Text style={styles.label}>Data</Text>
        <Text style={styles.value}>{formatDate(record.data)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#058301',
    textAlign: 'center',
    marginBottom: 30,
  },
  detailBox: {
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#585858',
  },
});
