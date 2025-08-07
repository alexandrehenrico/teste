import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { SigninGoogle } from 'generic-google-signin';
import styles from './LoginScreen.style.js';

// Constantes para validação
const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_REGEX: /^[a-zA-ZÀ-ÿ\s]+$/,
};

// Mensagens de erro padronizadas
const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Por favor, insira um email válido.',
  INVALID_NAME: 'Nome deve conter apenas letras e espaços.',
  WEAK_PASSWORD: 'A senha deve ter pelo menos 6 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.',
  PASSWORD_MISMATCH: 'As senhas não coincidem.',
  EMPTY_FIELDS: 'Todos os campos são obrigatórios.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
};

// Códigos de erro do Firebase
const FIREBASE_ERROR_CODES = {
  'auth/email-already-in-use': 'Este email já está em uso. Tente fazer login ou use outro email.',
  'auth/invalid-email': 'Email inválido.',
  'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
  'auth/user-not-found': 'Usuário não encontrado. Verifique o email ou crie uma conta.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'auth/user-disabled': 'Esta conta foi desabilitada.',
  'auth/operation-not-allowed': 'Operação não permitida.',
};

export default function LoginScreen() {
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    repetirSenha: '',
  });

  // Estados de controle da UI
  const [uiState, setUiState] = useState({
    isPasswordVisible: false,
    isLogin: true,
    isPasswordFocused: false,
    isLoading: false,
  });

  const navigation = useNavigation();

  // Validações de senha em tempo real
  const passwordRequirements = {
    tamanhoMinimo: formData.senha.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH,
    possuiMaiuscula: /[A-Z]/.test(formData.senha),
    possuiMinuscula: /[a-z]/.test(formData.senha),
    possuiNumero: /\d/.test(formData.senha),
  };

  // Funções de validação
  const validateName = (name) => VALIDATION_RULES.NAME_REGEX.test(name.trim());
  const validateEmail = (email) => VALIDATION_RULES.EMAIL_REGEX.test(email);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  // Atualiza dados do formulário
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Atualiza estado da UI
  const updateUIState = (field, value) => {
    setUiState(prev => ({ ...prev, [field]: value }));
  };

  // Tratamento de erros do Firebase
  const handleFirebaseError = (error) => {
    console.error('Firebase Error:', error);
    
    const errorMessage = FIREBASE_ERROR_CODES[error.code] || ERROR_MESSAGES.GENERIC_ERROR;
    Alert.alert('Erro de Autenticação', errorMessage);
  };

  // Validação completa do formulário
  const validateForm = () => {
    const { nome, email, senha, repetirSenha } = formData;
    const { isLogin } = uiState;

    // Validação do nome (apenas para cadastro)
    if (!isLogin && !validateName(nome)) {
      Alert.alert('Erro', ERROR_MESSAGES.INVALID_NAME);
      return false;
    }

    // Validação do email
    if (!validateEmail(email)) {
      Alert.alert('Erro', ERROR_MESSAGES.INVALID_EMAIL);
      return false;
    }

    // Validação da senha
    if (!isPasswordValid) {
      Alert.alert('Erro', ERROR_MESSAGES.WEAK_PASSWORD);
      return false;
    }

    // Validação de confirmação de senha (apenas para cadastro)
    if (!isLogin && senha !== repetirSenha) {
      Alert.alert('Erro', ERROR_MESSAGES.PASSWORD_MISMATCH);
      return false;
    }

    return true;
  };

  // Salva dados do usuário no AsyncStorage
  const saveUserData = async (email, additionalData = {}) => {
    try {
      await AsyncStorage.setItem('userEmail', email);
      
      // Salva dados adicionais se fornecidos
      if (additionalData.name) {
        await AsyncStorage.setItem('userName', additionalData.name);
      }
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
    }
  };

  // Autenticação principal
  const handleAuthentication = async () => {
    if (!validateForm()) return;

    updateUIState('isLoading', true);

    try {
      const { email, senha, nome } = formData;
      const { isLogin } = uiState;

      if (isLogin) {
        // Login
        const userCredential = await auth().signInWithEmailAndPassword(email, senha);
        await saveUserData(email);
        
        console.log('Login realizado com sucesso:', userCredential.user.uid);
      } else {
        // Cadastro
        const userCredential = await auth().createUserWithEmailAndPassword(email, senha);
        
        // Atualiza o perfil do usuário com o nome
        await userCredential.user.updateProfile({
          displayName: nome,
        });

        await saveUserData(email, { name: nome });
        
        console.log('Cadastro realizado com sucesso:', userCredential.user.uid);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      }
    } catch (error) {
      handleFirebaseError(error);
    } finally {
      updateUIState('isLoading', false);
    }
  };

  // Login com Google
  const handleGoogleSignIn = async () => {
    updateUIState('isLoading', true);

    try {
      // Configuração do Google Sign-In
      const result = await SigninGoogle({
        auth,
        androidClientId: "1032695653888-q88dm9qcgodf05asmmojacql5p0ssu6a.apps.googleusercontent.com",
        webClientId: "1032695653888-ctl8rqffmniqn8m895qreu4mq2s7lrvl.apps.googleusercontent.com",
      });

      if (result && result.user) {
        const { user } = result;
        
        // Salva dados do usuário
        await saveUserData(user.email, { 
          name: user.displayName || 'Usuário Google' 
        });

        console.log('Login com Google realizado com sucesso:', user.uid);
        Alert.alert('Sucesso', 'Login com Google realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
      
      // Tratamento específico para erros do Google Sign-In
      if (error.code === 'auth/popup-closed-by-user') {
        Alert.alert('Cancelado', 'Login com Google foi cancelado.');
      } else if (error.code === 'auth/network-request-failed') {
        Alert.alert('Erro', ERROR_MESSAGES.NETWORK_ERROR);
      } else {
        Alert.alert('Erro', 'Falha no login com Google. Tente novamente.');
      }
    } finally {
      updateUIState('isLoading', false);
    }
  };

  // Monitora mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('Usuário autenticado:', user.uid);
        // A navegação será tratada pelo App.js
      }
    });

    return unsubscribe;
  }, []);

  // Alterna entre login e cadastro
  const toggleAuthMode = () => {
    updateUIState('isLogin', !uiState.isLogin);
    
    // Limpa os campos ao alternar
    setFormData({
      nome: '',
      email: '',
      senha: '',
      repetirSenha: '',
    });
  };

  // Renderiza indicadores de requisitos da senha
  const renderPasswordRequirements = () => {
    if (!uiState.isLogin && uiState.isPasswordFocused) {
      return (
        <View style={styles.requisitosContainer}>
          <Text style={passwordRequirements.tamanhoMinimo ? styles.valid : styles.invalid}>
            ✓ Pelo menos 6 caracteres
          </Text>
          <Text style={passwordRequirements.possuiMaiuscula ? styles.valid : styles.invalid}>
            ✓ Pelo menos 1 letra maiúscula
          </Text>
          <Text style={passwordRequirements.possuiMinuscula ? styles.valid : styles.invalid}>
            ✓ Pelo menos 1 letra minúscula
          </Text>
          <Text style={passwordRequirements.possuiNumero ? styles.valid : styles.invalid}>
            ✓ Pelo menos 1 número
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authContainer}>
          {/* Logo */}
          <Image source={require('../../../assets/logo.png')} style={styles.logo} />

          {/* Mensagem de boas-vindas */}
          <Text style={styles.welcome}>
            {uiState.isLogin 
              ? 'Entre para acessar seus dados' 
              : 'Crie uma conta para começar a ter um controle avançado'
            }
          </Text>

          {/* Campo Nome (apenas no cadastro) */}
          {!uiState.isLogin && (
            <>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={formData.nome}
                onChangeText={(value) => updateFormData('nome', value)}
                placeholder="Digite o seu nome"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!uiState.isLoading}
              />
            </>
          )}

          {/* Campo Email */}
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Digite seu e-mail"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!uiState.isLoading}
          />

          {/* Campo Senha */}
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.senha}
              onChangeText={(value) => updateFormData('senha', value)}
              placeholder="Digite sua senha"
              secureTextEntry={!uiState.isPasswordVisible}
              onFocus={() => updateUIState('isPasswordFocused', true)}
              onBlur={() => updateUIState('isPasswordFocused', false)}
              editable={!uiState.isLoading}
            />
            <TouchableOpacity 
              onPress={() => updateUIState('isPasswordVisible', !uiState.isPasswordVisible)}
              disabled={uiState.isLoading}
            >
              <Icon
                name={uiState.isPasswordVisible ? 'visibility' : 'visibility-off'}
                size={24}
                color="#058301"
              />
            </TouchableOpacity>
          </View>

          {/* Campo Repetir Senha (apenas no cadastro) */}
          {!uiState.isLogin && (
            <>
              <Text style={styles.label}>Repetir Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.repetirSenha}
                  onChangeText={(value) => updateFormData('repetirSenha', value)}
                  placeholder="Repita sua senha"
                  secureTextEntry={!uiState.isPasswordVisible}
                  editable={!uiState.isLoading}
                />
                <TouchableOpacity 
                  onPress={() => updateUIState('isPasswordVisible', !uiState.isPasswordVisible)}
                  disabled={uiState.isLoading}
                >
                  <Icon
                    name={uiState.isPasswordVisible ? 'visibility' : 'visibility-off'}
                    size={24}
                    color="#058301"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Indicadores de requisitos da senha */}
          {renderPasswordRequirements()}

          {/* Botão principal de autenticação */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.authButton, uiState.isLoading && styles.disabledButton]}
              onPress={handleAuthentication}
              disabled={uiState.isLoading}
            >
              {uiState.isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {uiState.isLogin ? 'Entrar' : 'Cadastrar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divisor */}
          <Text style={styles.ou}>ou</Text>

          {/* Botão Google Sign-In */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.googleButton, uiState.isLoading && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={uiState.isLoading}
            >
              {uiState.isLoading ? (
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <>
                  <Image
                    source={{
                      uri: 'https://developers.google.com/identity/images/g-logo.png'
                    }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>Entrar com Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Link para alternar entre login e cadastro */}
          <TouchableOpacity 
            onPress={toggleAuthMode}
            activeOpacity={0.6}
            disabled={uiState.isLoading}
          >
            <Text style={[styles.toggleText, uiState.isLoading && styles.disabledText]}>
              {uiState.isLogin 
                ? 'Precisa de uma conta? Cadastre-se' 
                : 'Já tem uma conta? Conecte-se'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}