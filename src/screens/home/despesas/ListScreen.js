import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// ❌ Apague isso do seu código
import { FontAwesome } from '@expo/vector-icons';

export const calculateTotald = (records) => {
  if (!records || records.length === 0) return 0;
  const total = records.reduce((sum, record) => sum + (Number(record.valor) || 0), 0);
  return total;
};

export default function ListScreen({ navigation }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('despesas')
      .where('owner', '==', currentUser.uid)
      .orderBy('data', 'desc')
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          data: doc.data().data?.toDate?.() || new Date(),
        }));
        setRecords(data);
      }, error => {
        console.error('Erro ao buscar despesas:', error);
      });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", onPress: async () => {
            try {
              await firestore().collection('despesas').doc(id).delete();
              Alert.alert("Sucesso", "Despesa excluída com sucesso!");
            } catch (error) {
              console.error("Erro ao excluir despesa:", error);
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item) => {
    navigation.navigate('AddEdit', {
      record: item
    });
  };

  const handleDetail = (item) => {
    navigation.navigate('DetailScreen', { record: item });
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString('pt-BR');
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordContainer}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordValor}>
          Valor: {(Number(item.valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
        <Text style={styles.recordText}>Propriedade: {item.property}</Text>
        <Text style={styles.recordText}>Forma de Pagamento: {item.formaPagamento}</Text>
        <Text style={styles.recordText}>Data: {formatDate(item.data)}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.iconButton, styles.editButton]} onPress={() => handleEdit(item)}>
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.detailButton]} onPress={() => handleDetail(item)}>
          <Icon name="info" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Despesas</Text>
        <TouchableOpacity style={styles.addButtonHeader} onPress={() => navigation.navigate('AddEdit')}>
          <FontAwesome name="plus" size={24} color="#058301" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total de Despesas: {records.length}</Text>
        <Text style={styles.summaryText}>
          Valor Total: {(calculateTotald(records) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item, index) => index.toString()}
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
    borderBottomRightRadius: 15,  },
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
  recordValor: {
    fontSize: 18,
    fontWeight: 900,
    color: '#555',
    marginBottom: 4,
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
