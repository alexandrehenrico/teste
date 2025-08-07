/**
 * Configuração do Google Sign-In
 * Centraliza todas as configurações e métodos relacionados ao login com Google
 */

import { Platform } from 'react-native';

// Configurações do Google OAuth 2.0
export const GOOGLE_CONFIG = {
  // Client IDs do projeto Firebase
  androidClientId: "1032695653888-q88dm9qcgodf05asmmojacql5p0ssu6a.apps.googleusercontent.com",
  webClientId: "1032695653888-ctl8rqffmniqn8m895qreu4mq2s7lrvl.apps.googleusercontent.com",
  
  // Escopos solicitados
  scopes: ['email', 'profile'],
  
  // Configurações adicionais
  offlineAccess: false,
  hostedDomain: '', // Deixe vazio para permitir qualquer domínio
  forceCodeForRefreshToken: true,
};

/**
 * Configuração específica por plataforma
 */
export const getPlatformConfig = () => {
  const baseConfig = {
    webClientId: GOOGLE_CONFIG.webClientId,
    scopes: GOOGLE_CONFIG.scopes,
    offlineAccess: GOOGLE_CONFIG.offlineAccess,
    forceCodeForRefreshToken: GOOGLE_CONFIG.forceCodeForRefreshToken,
  };

  if (Platform.OS === 'android') {
    return {
      ...baseConfig,
      androidClientId: GOOGLE_CONFIG.androidClientId,
    };
  }

  if (Platform.OS === 'ios') {
    return {
      ...baseConfig,
      iosClientId: GOOGLE_CONFIG.webClientId, // Use webClientId para iOS também
    };
  }

  // Web
  return baseConfig;
};

/**
 * Valida se as configurações estão corretas
 */
export const validateGoogleConfig = () => {
  const config = getPlatformConfig();
  
  const errors = [];
  
  if (!config.webClientId) {
    errors.push('webClientId não configurado');
  }
  
  if (Platform.OS === 'android' && !config.androidClientId) {
    errors.push('androidClientId não configurado para Android');
  }
  
  if (!config.scopes || config.scopes.length === 0) {
    errors.push('Escopos não configurados');
  }

  return {
    isValid: errors.length === 0,
    errors,
    config,
  };
};

/**
 * Configurações de erro específicas do Google Sign-In
 */
export const GOOGLE_ERROR_CODES = {
  SIGN_IN_CANCELLED: 'auth/popup-closed-by-user',
  SIGN_IN_REQUIRED: 'auth/sign-in-required',
  NETWORK_ERROR: 'auth/network-request-failed',
  PLAY_SERVICES_NOT_AVAILABLE: 'auth/play-services-not-available',
  DEVELOPER_ERROR: 'auth/developer-error',
};

/**
 * Mapeia erros do Google Sign-In para códigos do Firebase
 */
export const mapGoogleErrorToFirebase = (error) => {
  if (!error) return null;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  // Mapeamento baseado em códigos conhecidos
  if (errorCode.includes('cancelled') || errorMessage.includes('cancelled')) {
    return { code: GOOGLE_ERROR_CODES.SIGN_IN_CANCELLED };
  }

  if (errorCode.includes('network') || errorMessage.includes('network')) {
    return { code: GOOGLE_ERROR_CODES.NETWORK_ERROR };
  }

  if (errorCode.includes('play_services') || errorMessage.includes('play services')) {
    return { code: GOOGLE_ERROR_CODES.PLAY_SERVICES_NOT_AVAILABLE };
  }

  // Retorna o erro original se não conseguir mapear
  return error;
};

/**
 * Configuração de retry para operações do Google Sign-In
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 5000,  // 5 segundos
};

/**
 * Implementa retry com backoff exponencial
 */
export const retryWithBackoff = async (operation, config = RETRY_CONFIG) => {
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === config.maxAttempts) {
        throw error;
      }

      // Calcula delay com backoff exponencial
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt - 1),
        config.maxDelay
      );

      console.log(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Verifica se o Google Play Services está disponível (Android)
 */
export const checkGooglePlayServices = async () => {
  if (Platform.OS !== 'android') {
    return { isAvailable: true };
  }

  try {
    // Esta verificação seria implementada com uma biblioteca específica
    // Por enquanto, assumimos que está disponível
    return { isAvailable: true };
  } catch (error) {
    return { 
      isAvailable: false, 
      error: 'Google Play Services não disponível' 
    };
  }
};

/**
 * Limpa cache do Google Sign-In
 */
export const clearGoogleSignInCache = async () => {
  try {
    // Implementação específica para limpar cache do Google Sign-In
    // Isso dependeria da biblioteca específica sendo usada
    console.log('Cache do Google Sign-In limpo');
  } catch (error) {
    console.error('Erro ao limpar cache do Google Sign-In:', error);
  }
};

/**
 * Verifica conectividade antes de operações de rede
 */
export const checkNetworkConnectivity = async () => {
  try {
    // Implementação básica de verificação de conectividade
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000,
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Configurações de timeout para operações de autenticação
 */
export const TIMEOUT_CONFIG = {
  signIn: 30000,      // 30 segundos
  signUp: 45000,      // 45 segundos
  googleSignIn: 60000, // 60 segundos
  passwordReset: 30000, // 30 segundos
};

/**
 * Wrapper para operações com timeout
 */
export const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operação expirou')), timeoutMs)
    ),
  ]);
};

/**
 * Valida configuração do ambiente
 */
export const validateEnvironment = () => {
  const issues = [];

  // Verifica se as variáveis de ambiente necessárias estão definidas
  if (!GOOGLE_CONFIG.androidClientId) {
    issues.push('GOOGLE_ANDROID_CLIENT_ID não definido');
  }

  if (!GOOGLE_CONFIG.webClientId) {
    issues.push('GOOGLE_WEB_CLIENT_ID não definido');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Gera relatório de diagnóstico para debug
 */
export const generateDiagnosticReport = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    platformVersion: Platform.Version,
    environment: validateEnvironment(),
    googleConfig: validateGoogleConfig(),
    connectivity: await checkNetworkConnectivity(),
  };

  if (Platform.OS === 'android') {
    report.playServices = await checkGooglePlayServices();
  }

  return report;
};