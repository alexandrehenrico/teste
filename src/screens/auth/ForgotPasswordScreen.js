/**
 * Tela de Recuperação de Senha
 * Permite ao usuário redefinir sua senha via email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const navigation = useNavigation();
  const { sendPasswordResetEmail, validateEmail } = useAuth();

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu email.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setEmailSent(true);
      Alert.alert(
        'Email Enviado',
        'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível enviar o email de recuperação. Verifique se o email está correto.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
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
        <View style={styles.content}>
          {/* Header com botão voltar */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleBackToLogin}
              style={styles.backButton}
              disabled={isLoading}
            >
              <Icon name="arrow-back" size={24} color="#058301" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recuperar Senha</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo */}
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo} 
          />

          {/* Conteúdo principal */}
          {!emailSent ? (
            <>
              <Text style={styles.title}>Esqueceu sua senha?</Text>
              <Text style={styles.description}>
                Digite seu email abaixo e enviaremos instruções para redefinir sua senha.
              </Text>

              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!isLoading}
              />

              <TouchableOpacity 
                style={[styles.resetButton, isLoading && styles.disabledButton]}
                onPress={handlePasswordReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.resetButtonText}>Enviar Email</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Icon name="check-circle" size={80} color="#058301" />
              <Text style={styles.successTitle}>Email Enviado!</Text>
              <Text style={styles.successDescription}>
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </Text>
            </View>
          )}

          {/* Link para voltar ao login */}
          <TouchableOpacity 
            onPress={handleBackToLogin}
            style={styles.backToLoginContainer}
            disabled={isLoading}
          >
            <Text style={[styles.backToLoginText, isLoading && styles.disabledText]}>
              Voltar ao Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#058301',
  },
  placeholder: {
    width: 44, // Mesmo tamanho do botão voltar para centralizar o título
  },
  logo: {
    height: 100,
    width: '70%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
    marginLeft: 5,
  },
  input: {
    height: 50,
    borderColor: '#058301',
    borderWidth: 1.5,
    marginBottom: 30,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#058301',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 30,
  },
  resetButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#058301',
    marginTop: 20,
    marginBottom: 15,
  },
  successDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#058301',
    textDecorationLine: 'underline',
  },
  disabledText: {
    opacity: 0.6,
  },
});