import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const RelatorioScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { lote } = route.params || {};

  const [quant, setQuant] = useState(0);
  const [peso, setPeso] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [inputValor, setInputValor] = useState('');

  useEffect(() => {
    if (lote?.id) {
      const unsubscribe = firestore()
        .collection('rebanhos')
        .doc(lote.id)
        .onSnapshot(doc => {
          const data = doc.data();
          if (data) {
            setQuant(Number(data.quant) || 0);
            setPeso(Number(data.peso) || 0);
            setHistorico(data.historico || []);
          }
        });

      return () => unsubscribe();
    }
  }, [lote?.id]);

  const atualizarFirestore = async (novosDados) => {
    if (!lote?.id) return;
    try {
      await firestore()
        .collection('rebanhos')
        .doc(lote.id)
        .update(novosDados);
    } catch (err) {
      console.error("Erro ao atualizar Firestore:", err);
      Alert.alert("Erro", "Não foi possível salvar no Firestore.");
    }
  };

  const abrirModal = (tipo) => {
    setModalTipo(tipo);
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setInputValor('');
  };

  const adicionarPesagem = () => {
    const novaPesagem = parseFloat(inputValor);
    if (!isNaN(novaPesagem)) {
      const novoHistorico = [...historico, {
        tipo: 'Nova Pesagem',
        descricao: `Nova Pesagem: ${novaPesagem} Kg`,
        data: new Date().toISOString()
      }];
      setPeso(novaPesagem);
      setHistorico(novoHistorico);
      atualizarFirestore({ peso: novaPesagem, historico: novoHistorico });
    }
    fecharModal();
  };

  const modificarAnimais = (tipo) => {
    const qtdAnimais = parseInt(inputValor);
    if (!isNaN(qtdAnimais)) {
      const pesoEstimado = qtdAnimais * 100;
      let novaQuant = quant;
      let novoPeso = peso;
      let novaDescricao = '';

      if (tipo === 'adicionar') {
        novaQuant += qtdAnimais;
        novoPeso += pesoEstimado;
        novaDescricao = `+${qtdAnimais} Animais (${pesoEstimado} Kg) / Compra`;
      } else if (tipo === 'remover' && quant >= qtdAnimais) {
        novaQuant -= qtdAnimais;
        novoPeso -= pesoEstimado;
        novaDescricao = `-${qtdAnimais} Animais (${pesoEstimado} Kg) / Venda`;
      }

      const novoHistorico = [...historico, {
        tipo: tipo === 'adicionar' ? 'Adição' : 'Remoção',
        descricao: novaDescricao,
        data: new Date().toISOString()
      }];

      setQuant(novaQuant);
      setPeso(novoPeso);
      setHistorico(novoHistorico);

      atualizarFirestore({ quant: novaQuant, peso: novoPeso, historico: novoHistorico });
    }
    fecharModal();
  };

  const transferirLote = () => {
    const novoHistorico = [...historico, {
      tipo: 'Transferência',
      descricao: 'Transferência realizada para outra fazenda',
      data: new Date().toISOString()
    }];
    setHistorico(novoHistorico);
    atualizarFirestore({ historico: novoHistorico });
    fecharModal();
  };

  const renderHistoricoItem = ({ item }) => (
    <View style={styles.historicoItem}>
      <Text>{item.descricao}</Text>
      {item.data && <Text style={styles.historicoData}>{new Date(item.data).toLocaleDateString('pt-BR')}</Text>}
    </View>
  );

    return (
        <View style={styles.container}>
                {/* Cabeçalho com botão de adicionar */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Lotes de Animais</Text>
      </View>
            <Text style={styles.title}>{lote?.categoria || 'Identificação do Lote'}</Text>
            <Text style={styles.subtitle}>{lote?.propriedade || 'Nome da Propriedade'}</Text>

            <Text style={styles.label}>Quantidade de Animais</Text>
            <TextInput style={styles.input} value={`${quant} Animais`} editable={false} />

            <Text style={styles.label}>Peso Bruto (KG)</Text>
            <TextInput style={styles.input} value={`${peso} Kg`} editable={false} />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => abrirModal('remover')}>
                    <Text style={styles.buttonText}>Remover Animais</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => abrirModal('adicionar')}>
                    <Text style={styles.buttonText}>Adicionar Animais</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => abrirModal('pesagem')}>
                    <Text style={styles.buttonText}>Adicionar Pesagem</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => abrirModal('transferir')}>
                    <Text style={styles.buttonText}>Transferir Lote</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.historicoTitle}>Histórico de Atividades:</Text>
            <FlatList
                data={historico}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.historicoItem}>
                        <Text style={styles.historicoText}>
                            <Text style={{ fontWeight: 'bold' }}>{item.tipo}:</Text> {item.descricao}
                        </Text>
                    </View>
                )}
            />

            <Modal visible={modalVisivel} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {modalTipo === 'pesagem' && 'Adicionar Nova Pesagem'}
                            {modalTipo === 'adicionar' && 'Adicionar Animais'}
                            {modalTipo === 'remover' && 'Remover Animais'}
                            {modalTipo === 'transferir' && 'Transferir Lote'}
                        </Text>
                        {modalTipo !== 'transferir' && (
                            <TextInput
                                style={styles.modalInput}
                                keyboardType="numeric"
                                placeholder="Digite o valor"
                                value={inputValor}
                                onChangeText={setInputValor}
                            />
                        )}
                        <View style={styles.modalButtons}>
                            <Button title="Cancelar" onPress={fecharModal} color="red" />
                            <Button
                                title="Confirmar"
                                onPress={() => {
                                    if (modalTipo === 'pesagem') adicionarPesagem();
                                    else if (modalTipo === 'adicionar') modificarAnimais('adicionar');
                                    else if (modalTipo === 'remover') modificarAnimais('remover');
                                    else if (modalTipo === 'transferir') transferirLote();
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, },
    subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginHorizontal: 15, },
    label: { fontSize: 18, marginTop: 10, marginHorizontal: 20,},
    input: { borderWidth: 1, padding: 10, borderRadius: 5, marginVertical: 5, backgroundColor: '#f5f5f5', marginHorizontal: 15, },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, marginHorizontal: 15, },
    button: { backgroundColor: 'green', padding: 10, borderRadius: 5, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    historicoTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginHorizontal: 15,},
    historicoItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd', marginHorizontal: 5,},
    historicoText: { fontSize: 16, marginHorizontal: 5, },
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
  
});

export default DetailScreen;
