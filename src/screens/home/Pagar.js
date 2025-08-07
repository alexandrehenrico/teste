import firestore from '@react-native-firebase/firestore';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

const Contas = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [referencia, setReferencia] = useState('');
  const [contas, setContas] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas'); // Filtro: todas, pendentes, pagar, receber
  const [selectedContas, setSelectedContas] = useState([]); // Para seleção múltipla
  const [tipoConta, setTipoConta] = useState('pagar'); // Tipo: pagar ou receber


useEffect(() => {
  const unsubscribe = firestore()
    .collection('contas')
    .onSnapshot(snapshot => {
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContas(dados);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar contas:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do Firestore.');
      setLoading(false);
    });

  return () => unsubscribe();
}, []);

  // Formatar valor para exibição
  const formatarValorDisplay = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  // Formatar valor para salvar (R$)
  const formatarValorInput = (text) => {
    const apenasNumeros = text.replace(/[^0-9]/g, '');
    if (!apenasNumeros) {
      setValor('');
      return;
    }
    const valorFormatado = (parseFloat(apenasNumeros) / 100).toFixed(2);
    setValor(valorFormatado.toString().replace('.', ','));
  };

  // Adicionar nova conta
  const adicionarConta = async () => {
  if (!valor || !dataVencimento || !destinatario) {
    Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
    return;
  }

  const hoje = new Date();
  const [dia, mes, ano] = dataVencimento.split('/');
  const dataSelecionada = new Date(ano, mes - 1, dia);

  if (dataSelecionada < hoje) {
    Alert.alert('Erro', 'A data de vencimento não pode ser no passado.');
    return;
  }

  const novaConta = {
    valor: parseFloat(valor.replace(',', '.')),
    dataVencimento,
    destinatario,
    referencia,
    pago: false,
    tipo: tipoConta,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  try {
    await firestore().collection('contas').add(novaConta);
    setModalVisible(false);
    setValor('');
    setDataVencimento('');
    setDestinatario('');
    setReferencia('');
    setTipoConta('pagar');
  } catch (error) {
    console.error('Erro ao adicionar conta:', error);
    Alert.alert('Erro', 'Não foi possível salvar no Firestore.');
  }
};


  // Marcar conta como paga/recebida
 const marcarComoPago = async (id) => {
  try {
    await firestore().collection('contas').doc(id).update({ pago: true });
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    Alert.alert('Erro', 'Não foi possível marcar como pago.');
  }
};


  // Excluir conta
 const excluirConta = async (id) => {
  try {
    await firestore().collection('contas').doc(id).delete();
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    Alert.alert('Erro', 'Não foi possível excluir a conta.');
  }
};


  // Excluir contas selecionadas
  const excluirContasSelecionadas = () => {
  Alert.alert(
    'Excluir Contas',
    'Tem certeza que deseja excluir as contas selecionadas?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        onPress: async () => {
          try {
            const promises = selectedContas.map(id =>
              firestore().collection('contas').doc(id).delete()
            );
            await Promise.all(promises);
            setSelectedContas([]);
          } catch (error) {
            console.error('Erro ao excluir múltiplas contas:', error);
            Alert.alert('Erro', 'Não foi possível excluir as contas selecionadas.');
          }
        },
      },
    ]
  );
};

  // Selecionar/desselecionar conta
  const handleLongPress = (id) => {
    setSelectedContas((prev) =>
      prev.includes(id) ? prev.filter((contaId) => contaId !== id) : [...prev, id]
    );
  };

  // Filtrar contas
  const filteredContas = contas.filter((conta) => {
    if (filter === 'pendentes') return !conta.pago;
    if (filter === 'pagar') return conta.tipo === 'pagar' && !conta.pago;
    if (filter === 'receber') return conta.tipo === 'receber' && !conta.pago;
    return true; // Todas
  });

  // Calcular saldo total
  const saldoTotal = contas.reduce((total, conta) => {
    if (conta.tipo === 'pagar') {
      return total - conta.valor;
    } else {
      return total + conta.valor;
    }
  }, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#058301" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Contas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <FontAwesome name="plus" size={24} color="#058301" />
        </TouchableOpacity>
      </View>

      {/* Resumo e Saldo */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total de Contas: {contas.length}</Text>
        <Text style={styles.summaryText}>Saldo: {formatarValorDisplay(saldoTotal)}</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter('todas')}>
          <Text style={filter === 'todas' ? styles.activeFilter : styles.filterText}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('pendentes')}>
          <Text style={filter === 'pendentes' ? styles.activeFilter : styles.filterText}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('pagar')}>
          <Text style={filter === 'pagar' ? styles.activeFilter : styles.filterText}>Pagar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('receber')}>
          <Text style={filter === 'receber' ? styles.activeFilter : styles.filterText}>Receber</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Contas */}
      <FlatList
        data={filteredContas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              item.pago && styles.cardPago,
              selectedContas.includes(item.id) && styles.selectedCard,
            ]}
            onLongPress={() => handleLongPress(item.id)}
            onPress={() => selectedContas.length > 0 && handleLongPress(item.id)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>Valor: {formatarValorDisplay(item.valor)}</Text>
              <Text style={styles.cardText}>Vencimento: {item.dataVencimento}</Text>
              <Text style={styles.cardText}>Destinatário: {item.destinatario}</Text>
              <Text style={styles.cardText}>Referência: {item.referencia || 'N/A'}</Text>
              <Text style={[styles.cardText, { color: item.tipo === 'pagar' ? '#c41616' : '#058301' }]}>
                Tipo: {item.tipo.toUpperCase()}
              </Text>
            </View>
            {!item.pago && (
              <TouchableOpacity
                style={styles.pagoButton}
                onPress={() => marcarComoPago(item.id)}
              >
                <FontAwesome name="check" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            {selectedContas.includes(item.id) && (
              <TouchableOpacity
                style={styles.excluirButton}
                onPress={() => excluirConta(item.id)}
              >
                <Icon name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Botão para excluir contas selecionadas */}
      {selectedContas.length > 0 && (
        <TouchableOpacity style={styles.deleteAllButton} onPress={excluirContasSelecionadas}>
          <Text style={styles.deleteAllButtonText}>Excluir Selecionadas</Text>
        </TouchableOpacity>
      )}

      {/* Modal para adicionar nova conta */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Conta</Text>
            <Text style={styles.label}>Valor</Text>
            <TextInput
              style={styles.input}
              placeholder="Informe o valor (R$)"
              keyboardType="numeric"
              value={valor}
              onChangeText={formatarValorInput}
            />
            <Text style={styles.label}>Vencimento</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text>{dataVencimento || 'Selecione a data'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const dataFormatada = selectedDate.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });
                    setDataVencimento(dataFormatada);
                  }
                }}
              />
            )}
            <Text style={styles.label}>Destinatário</Text>
            <TextInput
              style={styles.input}
              placeholder="Informe o Destinatário"
              value={destinatario}
              onChangeText={setDestinatario}
            />
            <Text style={styles.label}>Referência (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Referência"
              value={referencia}
              onChangeText={setReferencia}
            />
            <Text style={styles.label}>Tipo</Text>
            <Picker
              selectedValue={tipoConta}
              onValueChange={(itemValue) => setTipoConta(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Pagar" value="pagar" />
              <Picker.Item label="Receber" value="receber" />
            </Picker>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.salvarButton} onPress={adicionarConta}>
                <Text style={styles.salvarButtonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelarButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelarButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
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
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  summary: {
    backgroundColor: '#058301',
    padding: 15,
    borderRadius: 10,
    margin: 15,
  },
  summaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  filterText: { fontSize: 16, color: '#666' },
  activeFilter: { fontSize: 16, color: '#058301', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPago: { backgroundColor: '#d3ffd3' },
  selectedCard: { borderColor: '#c41616', borderWidth: 2 },
  cardContent: { flex: 1 },
  cardText: { fontSize: 14, color: '#666' },
  pagoButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'green',
  },
  excluirButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'red',
  },
  deleteAllButton: {
    backgroundColor: '#c41616',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  deleteAllButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: { fontSize: 20, color: '#058301', marginBottom: 20, textAlign: 'center', fontWeight: '900' },
  label: { marginBottom: 8, marginTop: 8, color: '#404040', fontSize: 15, fontWeight: 'bold' },
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
    justifyContent: 'center',
  },
  picker: {
    backgroundColor: '#eee',
    marginBottom: 10,
    borderRadius: 5,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around' },
  salvarButton: {
    flex: 1,
    backgroundColor: '#058301',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  salvarButtonText: { color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  cancelarButton: {
    flex: 1,
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelarButtonText: { color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default Contas;
