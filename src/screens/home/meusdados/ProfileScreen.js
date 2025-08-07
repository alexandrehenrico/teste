//ProfileScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView } from 'react-native';
import {View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, Modal, FlatList, KeyboardAvoidingView, Platform,} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './ProfileScreen.style.js'; 
import PlanCard from './PlanCard'; 
import { Linking } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; 

const openURL = async (url) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    Alert.alert(
      'Abrir Link',
      'Você está prestes a sair do aplicativo. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir', onPress: () => Linking.openURL(url) }
      ]
    );
  } else {
    Alert.alert('Erro', ' Não foi possível abrir o link.');
  }
};

const handleImageSelection = async (fromCamera, setProfileImage) => {
  const permissionResult = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (!permissionResult.granted) {
    Alert.alert(
      'Permissão Negada', 
      `Você precisa conceder acesso à ${fromCamera ? 'câmera' : 'galeria'}.`
    );
    return;
  }

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 })
    : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 });

  if (!result.canceled && result.assets?.length > 0) {
    const imageUri = result.assets[0].uri;
    setProfileImage(imageUri);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_IMAGE, imageUri);
  }
};

const STORAGE_KEYS = {
  USERNAME: 'userName',
  PROFILE_IMAGE: 'profileImage',
};

const ProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [profileImage, setProfileImage] = useState(
    'https://cdn-icons-png.flaticon.com/256/847/847969.png'
  );
  const [userName, setUserName] = useState('Usuário Finagro');
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    
    const loadProfileData = async () => {
      try {
        const storedName = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
        const storedImage = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_IMAGE);

        if (storedName) setUserName(storedName);
        if (storedImage) setProfileImage(storedImage);
      } catch (error) {
        console.error('Erro ao carregar dados do AsyncStorage:', error);
      }
    };

    const loadProperties = async () => {
  try {
    const snapshot = await firestore().collection('propriedades').get();
    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProperties(fetched);
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
  }
};


    loadProfileData();
    loadProperties();
  }, []);

  const saveProfileData = async () => {
    try {
      if (userName.trim().length === 0) {
        Alert.alert('Erro', 'Nome não pode estar vazio.');
        return;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, userName);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_IMAGE, profileImage);
      Alert.alert('Sucesso', 'Perfil salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados no AsyncStorage:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão Negada', 'Você precisa conceder acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permissão Negada', 'Você precisa conceder acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const changeProfileImage = () => {
    Alert.alert(
      'Alterar Foto de Perfil',
      'Escolha uma opção',
      [
        { text: 'Galeria', onPress: () => handleImageSelection(false, setProfileImage) },
        { text: 'Tirar Foto', onPress: () => handleImageSelection(true, setProfileImage) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };
    
  const toggleEdit = () => {
    if (isEditing) {
      saveProfileData();
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      await auth().signOut();

    } catch (error) {
      Alert.alert('Erro ao sair', error.message);
    }
  };

  const menuOptions = useMemo(() => [
    { title: 'Propriedades Cadastradas', iconName: 'warehouse', content: 'propriedades' },
    { title: 'Privacidade', iconName: 'lock', content: 'privacidade' },
    { title: 'Termos de Uso', iconName: 'article', content: 'manual' },
    { title: 'Mudar senha', iconName: 'vpn-key', content: 'senha' },
    { title: 'Suporte', iconName: 'support-agent', content: 'Suporte' },
    { title: 'Seja um Produtor Premium', iconName: 'verified', content: 'Planos' },


  ], []);

  const openModal = (content) => {
    let modalContentToRender = null;
    switch (content) {
      case 'propriedades':
        modalContentToRender = (
          <FlatList
            data={properties}
            keyExtractor={(item, index) => item.id?.toString() || `prop-${index}`}
            renderItem={({ item }) => (
              <View style={styles.propertyItem} accessibilityLabel={`Propriedade: ${item.name}`}>
                <Icon name="home" size={24} color="#058301" style={styles.propertyIcon} />
                <Text style={styles.propertyName}>{item.name}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText} accessibilityLabel="Nenhuma propriedade cadastrada">
                  Nenhuma propriedade cadastrada.
                </Text>
              </View>
            }
            contentContainerStyle={properties.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : {}}
          />
        );
        break;
            case 'privacidade':
        modalContentToRender = (
          <Text style={styles.modalText}>
            Seus dados estão protegidos e tratados com o mais alto padrão de segurança.
          </Text>
        );
        break;
      case 'manual':
        modalContentToRender = (
          <Text style={styles.modalText}>
            Este é o manual do usuário. Aqui você encontra orientações para utilizar o aplicativo.
          </Text>
        );
        break;
      case 'senha':
        modalContentToRender = (
          <Text style={styles.modalText}>
            Redefina sua senha para proteger sua conta.
          </Text>
        );
        break;        
        case 'Suporte': 
          modalContentToRender = (
            <View style={styles.modalSuporte}>
              <Text style={styles.modalTitleSuporte}>Suporte</Text>
              <Text style={styles.modalTextSuporte}>
                Precisa de ajuda? Entre em contato conosco através das nossas plataformas oficiais:
              </Text>
        
              <TouchableOpacity 
                style={styles.modalButtonSuporte} 
                onPress={() => openURL('https://www.instagram.com/finagro.app/')}
                accessibilityLabel="Acessar o Instagram do Finagro"
              >
                <Text style={styles.buttonTextSuporte}>Instagram (@finagro.app)</Text>
              </TouchableOpacity>
        
              <TouchableOpacity 
                style={styles.modalButtonSuporte} 
                onPress={() => openURL('mailto:finagrogestaorural@gmail.com')}
                accessibilityLabel="Enviar e-mail para o Finagro"
              >
                <Text style={styles.buttonTextSuporte}>Enviar E-mail</Text>
              </TouchableOpacity>
        
              <TouchableOpacity 
                style={styles.modalButtonSuporte} 
                onPress={() => openURL('https://www.youtube.com/@finagroapp')}
                accessibilityLabel="Acessar o canal do YouTube do Finagro"
              >
                <Text style={styles.buttonTextSuporte}>Canal no YouTube</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalButtonSuporte} 
                onPress={() => openURL('https://www.finagro.app')}
                accessibilityLabel="Acessar o site do Finagro"
              >
                <Text style={styles.buttonTextSuporte}>Site do Finagro</Text>
              </TouchableOpacity>

            </View>
          );
          break;
                        
// Modal no arquivo ProfileScreen.js
case 'Planos':
  modalContentToRender = (
    <View style={styles.modalPlanos}>
      {/* Títulos fixos */}
      <View style={styles.headerContainer}>
        <Text style={styles.modalTitle}>Seja um Produtor Premium!</Text>
        <Text style={styles.modalSubtitle}>Escolha o plano ideal para alavancar sua produção:</Text>
      </View>
  
      {/* Conteúdo rolável */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {[
          {
            icon: '⭐',
            title: 'Pequeno Produtor',
            details: 'Plano básico para pequenos produtores.',
            price: 'R$ 29,90/mês',
            onSelect: () => console.log('Pequeno Produtor selecionado'),
          },
          {
            icon: '🛒',
            title: 'Médio Produtor',
            details: 'Plano intermediário com mais benefícios.',
            price: 'R$ 49,90/mês',
            onSelect: () => console.log('Médio Produtor selecionado'),
          },
          {
            icon: '🌱',
            title: 'Grande Produtor',
            details: 'Plano premium para grandes produtores.',
            price: 'R$ 99,90/mês',
            onSelect: () => console.log('Grande Produtor selecionado'),
          },
        ].map((plan, index) => (
          <PlanCard key={index} {...plan} />
        ))}
      </ScrollView>
    </View>
  );
    break;

  }
    setModalContent(modalContentToRender);
    setModalVisible(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
<View style={styles.container}>
  {/* Header Fixo (não rola) */}
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Meus Dados</Text>
    <TouchableOpacity onPress={toggleEdit} style={styles.editButton}>
      <Icon name={isEditing ? 'check' : 'edit'} size={24} color="#058301" />
    </TouchableOpacity>
  </View>

  {/* Conteúdo Rolável */}
  <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
    <View style={styles.profileSection}>
      <TouchableOpacity onPress={changeProfileImage} accessibilityLabel="Alterar Foto de Perfil">
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <View style={styles.iconOverlay}>
          <Icon name="photo-camera" size={20} color="#FFF" />
        </View>
      </TouchableOpacity>

      {isEditing ? (
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          placeholder="Digite seu nome"
        />
      ) : (
        <Text style={styles.userName}>{userName}</Text>
      )}
    </View>

    <View style={styles.menuContainer}>
      {menuOptions.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => openModal(item.content)}
          accessibilityLabel={item.title}
        >
          <Icon name={item.iconName} size={24} color="#058301" style={styles.menuIcon} />
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <TouchableOpacity
      style={styles.logoutButton}
      onPress={handleLogout}
      accessibilityLabel="Sair da Conta"
    >
      <Icon name="logout" size={24} color="#FFF" style={styles.menuIcon} />
      <Text style={styles.logoutText}>Sair da Conta</Text>
    </TouchableOpacity>
    <Modal
  visible={modalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {modalContent}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Icon name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
</Modal>
</ScrollView>
</View>


    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;
