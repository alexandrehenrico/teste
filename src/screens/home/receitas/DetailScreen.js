import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function DetailScreen({ route }) {
  const { record } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>Detalhes da Receita</Text>

      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Data da Venda</Text>
        </View>
        <Text style={styles.value}>{record.data}</Text>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Origem da Venda</Text>
        </View>
        <Text style={styles.value}>{record.origem}</Text>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Valor</Text>
        </View>
        <Text style={styles.value}>R$ {parseFloat(record.valor).toFixed(2).replace('.', ',')}</Text>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Pagador</Text>
        </View>
        <Text style={styles.value}>{record.pagador}</Text>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Data do Pagamento</Text>
        </View>
        <Text style={styles.value}>{record.data2}</Text>
      </View>

      {/* Forma de Pagamento - Correção completa */}
      <View style={styles.detailBox}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Forma de Pagamento</Text>
        </View>
        <Text style={styles.value}>{record.pagamento}</Text>
      </View>
    </ScrollView>
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
  label: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 6,
    color: '#4A4A4A',
},
  value: {
    fontSize: 18,
    marginBottom: 10,
    color: '#585858',
},
});
