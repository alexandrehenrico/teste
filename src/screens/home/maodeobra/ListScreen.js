import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';

// Função para calcular o total de mão de obra
export const calculateTotalma = (records) => {
  if (!records || records.length === 0) return 0;
  const total = records.reduce((sum, record) => sum + (record.valor || 0), 0);
  return total;
};

export default function ListScreen({ navigation }) {
  const [records, setRecords] = useState([]);

  // Carregar dados em tempo real do Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('maoDeObra')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(data);
      });

    return unsubscribe;
  }, []);

  // Excluir do Firestore
  const handleDelete = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              await firestore().collection('maoDeObra').doc(id).delete();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir o registro.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item) => {
    navigation.navigate('AddEdit', {
      record: item,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleDetail = (item) => {
    if (!item) {
      Alert.alert("Erro", "Não foi possível acessar os detalhes do registro.");
      return;
    }
    navigation.navigate('DetailScreen', { record: item });
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordContainer}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordValor}>Valor: {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
        <Text style={styles.recordText}>Propriedade: {item.property}</Text>
        <Text style={styles.recordText}>Funcionário: {item.nome}</Text>
        <Text style={styles.recordText}>Forma de Pagamento: {item.formaPagamento}</Text>
        <Text style={styles.recordText}>Data: {formatDate(item.data)}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.iconButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.detailButton]}
          onPress={() => handleDetail(item)}
        >
          <Icon name="info" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mão de Obra</Text>
        <TouchableOpacity
          style={styles.addButtonHeader}
          onPress={() => navigation.navigate('AddEdit')}
        >
          <FontAwesome name="plus" size={24} color="#058301" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total de Serviços: {records.length}</Text>
        <Text style={styles.summaryText}>
          Valor Total: {calculateTotalma(records).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum registro encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    backgroundColor: '#058301',
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  recordValor: {
    fontSize: 18,
    fontWeight: 900,
    color: '#555',
    marginBottom: 4,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButtonHeader: {
    backgroundColor: '#fff',
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    backgroundColor: '#058301',
    padding: 15,
    borderRadius: 10,
    margin: 15,
  },
  summaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordInfo: {
    flex: 1,
  },
  recordText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: '#058301',
  },
  deleteButton: {
    backgroundColor: '#FF5722',
  },
  detailButton: {
    backgroundColor: '#2196F3',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});
