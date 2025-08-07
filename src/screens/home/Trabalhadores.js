// trabalhadores
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';

import styles from './Trabalhadores.styles.js'; // importação do estilo

const TrabalhadorCard = ({ trabalhador, onEdit, onDelete }) => (
  <View style={styles.card}>
    <Image
      source={{
        uri: trabalhador.foto || 'https://cdn-icons-png.flaticon.com/256/847/847969.png',
      }}
      style={styles.foto}
    />
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardNome}>Nome: {trabalhador.nome || 'Não informado'}</Text>
      <Text style={styles.cardText}>Contato: {trabalhador.contato || 'Não informado'}</Text>
      <Text style={styles.cardText}>Atuação: {trabalhador.areaAtuacao || 'Não informado'}</Text>
      <Text style={styles.cardText}>
  Data de Contrato: {trabalhador.dataContrato ? trabalhador.dataContrato.toLocaleDateString('pt-BR') : 'Não informado'}
</Text>

    </View>
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => onEdit(trabalhador.id)}
      >
        <Icon name="edit" size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(trabalhador.id)}
      >
        <Icon name="delete" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

const Trabalhadores = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [areaAtuacao, setAreaAtuacao] = useState('');
  const [dataContrato, setDataContrato] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [foto, setFoto] = useState(null);
  const [trabalhadores, setTrabalhadores] = useState([]);
  const [editarId, setEditarId] = useState(null);

  useEffect(() => {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    console.log("Nenhum usuário logado.");
    return;
  }

  const subscriber = firestore()
    .collection("trabalhadores")
    .where("owner", "==", currentUser.uid)
    .orderBy("dataContrato")
    .onSnapshot(querySnapshot => {
      const loaded = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataContrato: doc.data().dataContrato?.toDate?.() || new Date(), // garantir compatibilidade
      }));
      setTrabalhadores(loaded);
    }, error => {
      console.error("Erro ao buscar trabalhadores: ", error);
    });

  return () => subscriber();
}, []); 

  const salvarDados = async (dados) => {
    await AsyncStorage.setItem('trabalhadores', JSON.stringify(dados));
  };

  const selecionarFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Erro', 'Permissão para acessar a galeria é necessária.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Compressão de imagem
    });
  
    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };
  
const adicionarOuEditarTrabalhador = async () => {
  if (!nome || !contato || !areaAtuacao) {
    Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const currentUser = auth().currentUser;
  if (!currentUser) return;

  const trabalhador = {
    nome,
    contato,
    areaAtuacao,
    dataContrato,
    foto,
    owner: currentUser.uid,
  };

  try {
    if (editarId) {
      await firestore().collection("trabalhadores").doc(editarId).update(trabalhador);
      Alert.alert('Sucesso', 'Trabalhador atualizado com sucesso!');
    } else {
      await firestore().collection("trabalhadores").add(trabalhador);
      Alert.alert('Sucesso', 'Trabalhador adicionado com sucesso!');
    }

    setNome('');
    setContato('');
    setAreaAtuacao('');
    setDataContrato(new Date());
    setFoto(null);
    setEditarId(null);
    setModalVisible(false);

  } catch (error) {
    console.error("Erro ao salvar trabalhador: ", error);
    Alert.alert('Erro', 'Não foi possível salvar.');
  }
};


const excluirTrabalhador = async (id) => {
  try {
    await firestore().collection("trabalhadores").doc(id).delete();
    Alert.alert('Sucesso', 'Trabalhador excluído com sucesso!');
  } catch (error) {
    console.error("Erro ao excluir trabalhador: ", error);
    Alert.alert('Erro', 'Não foi possível excluir.');
  }
};

  
  const editarTrabalhador = (id) => {
    const trabalhador = trabalhadores.find((t) => t.id === id);
    if (trabalhador) {
      setNome(trabalhador.nome);
      setContato(trabalhador.contato);
      setAreaAtuacao(trabalhador.areaAtuacao);
      setDataContrato(trabalhador.dataContrato instanceof Date
  ? trabalhador.dataContrato
  : new Date(trabalhador.dataContrato));
      setFoto(trabalhador.foto);
      setEditarId(id);
      setModalVisible(true);
    }
  };
  
  
 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Funcionários</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
  <View style={styles.addButtonCircle}>
    <FontAwesome name="plus" size={24} color="#058301" />
  </View>
</TouchableOpacity>

      </View>

      <ScrollView style={styles.scrollView}>
        {trabalhadores.map((trabalhador) => (
          <TrabalhadorCard
            key={trabalhador.id}
            trabalhador={trabalhador}
            onEdit={editarTrabalhador}
            onDelete={excluirTrabalhador}
          />
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editarId ? 'Editar Trabalhador' : 'Adicionar Trabalhador'}
            </Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Informe o nome"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>Contato</Text>
            <TextInput
              style={styles.input}
              placeholder="Informe o contato"
              value={contato}
              onChangeText={setContato}
            />

            <Text style={styles.label}>Área de Atuação</Text>
            <TextInput
              style={styles.input}
              placeholder="Informe a área de atuação"
              value={areaAtuacao}
              onChangeText={setAreaAtuacao}
            />

            <Text style={styles.label}>Data de Contrato</Text>
            <TouchableOpacity style={styles.input} onPress={() => setMostrarCalendario(true)}>
  <Text>{dataContrato?.toLocaleDateString() || 'Selecionar data'}</Text>
</TouchableOpacity>
            {mostrarCalendario && (
              <DateTimePicker
                value={dataContrato}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setMostrarCalendario(false);
                  if (selectedDate) setDataContrato(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>Foto (Opcional)</Text>
            <TouchableOpacity style={styles.button} onPress={selecionarFoto}>
              <Text style={styles.buttonText}>Selecionar Foto</Text>
            </TouchableOpacity>
            {foto && <Image source={{ uri: foto }} style={styles.fotoPreview} />}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={adicionarOuEditarTrabalhador}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default Trabalhadores;