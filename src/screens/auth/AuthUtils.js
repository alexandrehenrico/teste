/**
 * Utilitários de Autenticação
 * Funções auxiliares para operações de autenticação
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Códigos de erro do Firebase traduzidos
export const FIREBASE_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Este email já está em uso. Tente fazer login ou use outro email.',
  'auth/invalid-email': 'Email inválido.',
  'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
  'auth/user-not-found': 'Usuário não encontrado. Verifique o email ou crie uma conta.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'auth/user-disabled': 'Esta conta foi desabilitada.',
  'auth/operation-not-allowed': 'Operação não permitida.',
  'auth/invalid-credential': 'Credenciais inválidas.',
  'auth/user-token-expired': 'Sessão expirada. Faça login novamente.',
  'auth/requires-recent-login': 'Esta operação requer login recente.',
  'auth/popup-closed-by-user': 'Login cancelado pelo usuário.',
  'auth/popup-blocked': 'Popup bloqueado pelo navegador.',
  'auth/cancelled-popup-request': 'Solicitação de popup cancelada.',
  'auth/internal-error': 'Erro interno. Tente novamente.',
};

/**
 * Traduz códigos de erro do Firebase para mensagens amigáveis
 */
export const translateFirebaseError = (error) => {
  if (!error || !error.code) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  return FIREBASE_ERROR_MESSAGES[error.code] || 'Erro desconhecido. Tente novamente.';
};

/**
 * Exibe alerta com erro traduzido do Firebase
 */
export const showFirebaseError = (error, title = 'Erro') => {
  const message = translateFirebaseError(error);
  Alert.alert(title, message);
};

/**
 * Valida força da senha
 */
export const validatePasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  
  let strength = 'Muito Fraca';
  if (score >= 4) strength = 'Forte';
  else if (score >= 3) strength = 'Média';
  else if (score >= 2) strength = 'Fraca';

  return {
    requirements,
    score,
    strength,
    isValid: requirements.minLength && requirements.hasUppercase && 
             requirements.hasLowercase && requirements.hasNumber,
  };
};

/**
 * Formata dados do usuário para exibição
 */
export const formatUserData = (user) => {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Usuário',
    photoURL: user.photoURL || null,
    emailVerified: user.emailVerified,
    creationTime: user.metadata?.creationTime,
    lastSignInTime: user.metadata?.lastSignInTime,
    isAnonymous: user.isAnonymous,
  };
};

/**
 * Limpa dados sensíveis do AsyncStorage
 */
export const clearSensitiveData = async () => {
  try {
    const keysToRemove = [
      'userPassword', // Nunca deveria existir, mas por segurança
      'authToken',
      'refreshToken',
      'tempData',
    ];

    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.error('Erro ao limpar dados sensíveis:', error);
  }
};

/**
 * Verifica se o dispositivo suporta biometria (placeholder para futuras implementações)
 */
export const checkBiometricSupport = async () => {
  // Implementação futura para autenticação biométrica
  return false;
};

/**
 * Gera token de sessão seguro (para uso futuro)
 */
export const generateSessionToken = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}_${random}`;
};

/**
 * Valida se a sessão ainda é válida
 */
export const isSessionValid = async () => {
  try {
    const lastLogin = await AsyncStorage.getItem('lastLogin');
    if (!lastLogin) return false;

    const lastLoginTime = new Date(lastLogin);
    const now = new Date();
    const diffInHours = (now - lastLoginTime) / (1000 * 60 * 60);

    // Sessão válida por 24 horas
    return diffInHours < 24;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return false;
  }
};

/**
 * Sanitiza entrada do usuário
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres potencialmente perigosos
    .substring(0, 255); // Limita tamanho
};

/**
 * Verifica se o email é de um domínio confiável (opcional)
 */
export const isEmailFromTrustedDomain = (email) => {
  const trustedDomains = [
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'icloud.com',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return trustedDomains.includes(domain);
};

/**
 * Logs de auditoria para operações de autenticação
 */
export const logAuthEvent = (event, details = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: 'React Native App',
  };

  console.log('Auth Event:', logData);
  
  // Em produção, enviar para serviço de analytics/logging
  // Analytics.track('auth_event', logData);
};

/**
 * Debounce para evitar múltiplas chamadas rápidas
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Máscara para email (para logs seguros)
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const maskedLocal = localPart.length > 2 
    ? `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}`
    : localPart;
    
  return `${maskedLocal}@${domain}`;
};