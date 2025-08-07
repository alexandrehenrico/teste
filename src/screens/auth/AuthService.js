/**
 * Serviço de Autenticação
 * Centraliza todas as operações de autenticação da aplicação
 */

import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Constantes
const STORAGE_KEYS = {
  USER_EMAIL: 'userEmail',
  USER_NAME: 'userName',
  USER_PROFILE_IMAGE: 'profileImage',
  LAST_LOGIN: 'lastLogin',
};

const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_REGEX: /^[a-zA-ZÀ-ÿ\s]+$/,
};

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListener = null;
  }

  /**
   * Inicializa o serviço de autenticação
   */
  initialize() {
    return new Promise((resolve) => {
      this.authStateListener = auth().onAuthStateChanged((user) => {
        this.currentUser = user;
        resolve(user);
      });
    });
  }

  /**
   * Valida email
   */
  validateEmail(email) {
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
  }

  /**
   * Valida nome
   */
  validateName(name) {
    return VALIDATION_RULES.NAME_REGEX.test(name.trim());
  }

  /**
   * Valida senha
   */
  validatePassword(password) {
    const requirements = {
      minLength: password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    };

    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements,
    };
  }

  /**
   * Salva dados do usuário no AsyncStorage
   */
  async saveUserData(userData) {
    try {
      const promises = [];
      
      if (userData.email) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, userData.email));
      }
      
      if (userData.name) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, userData.name));
      }
      
      if (userData.profileImage) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE_IMAGE, userData.profileImage));
      }

      // Salva timestamp do último login
      promises.push(AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString()));

      await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      throw new Error('Falha ao salvar dados do usuário');
    }
  }

  /**
   * Carrega dados do usuário do AsyncStorage
   */
  async loadUserData() {
    try {
      const [email, name, profileImage, lastLogin] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL),
        AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE_IMAGE),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN),
      ]);

      return {
        email,
        name,
        profileImage,
        lastLogin: lastLogin ? new Date(lastLogin) : null,
      };
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return {};
    }
  }

  /**
   * Realiza login com email e senha
   */
  async signInWithEmail(email, password) {
    try {
      if (!this.validateEmail(email)) {
        throw new Error('Email inválido');
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error('Senha não atende aos requisitos mínimos');
      }

      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      await this.saveUserData({
        email: userCredential.user.email,
        name: userCredential.user.displayName,
      });

      return userCredential.user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Realiza cadastro com email e senha
   */
  async signUpWithEmail(email, password, name) {
    try {
      if (!this.validateName(name)) {
        throw new Error('Nome inválido');
      }

      if (!this.validateEmail(email)) {
        throw new Error('Email inválido');
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error('Senha não atende aos requisitos mínimos');
      }

      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Atualiza o perfil do usuário
      await userCredential.user.updateProfile({
        displayName: name,
      });

      await this.saveUserData({
        email: userCredential.user.email,
        name: name,
      });

      return userCredential.user;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  /**
   * Realiza login com Google
   */
  async signInWithGoogle(config) {
    try {
      const { SigninGoogle } = require('generic-google-signin');
      
      const result = await SigninGoogle({
        auth,
        androidClientId: config.androidClientId,
        webClientId: config.webClientId,
      });

      if (result && result.user) {
        await this.saveUserData({
          email: result.user.email,
          name: result.user.displayName || 'Usuário Google',
        });

        return result.user;
      }

      throw new Error('Falha na autenticação com Google');
    } catch (error) {
      console.error('Erro no login com Google:', error);
      throw error;
    }
  }

  /**
   * Realiza logout
   */
  async signOut() {
    try {
      await auth().signOut();
      
      // Limpa dados sensíveis do AsyncStorage (mantém preferências do usuário)
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.LAST_LOGIN,
      ]);

      this.currentUser = null;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  /**
   * Envia email de redefinição de senha
   */
  async sendPasswordResetEmail(email) {
    try {
      if (!this.validateEmail(email)) {
        throw new Error('Email inválido');
      }

      await auth().sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      throw error;
    }
  }

  /**
   * Atualiza senha do usuário
   */
  async updatePassword(newPassword) {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error('Nova senha não atende aos requisitos mínimos');
      }

      await user.updatePassword(newPassword);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(profileData) {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const updateData = {};
      
      if (profileData.displayName) {
        if (!this.validateName(profileData.displayName)) {
          throw new Error('Nome inválido');
        }
        updateData.displayName = profileData.displayName;
      }

      if (profileData.photoURL) {
        updateData.photoURL = profileData.photoURL;
      }

      await user.updateProfile(updateData);
      
      // Atualiza dados no AsyncStorage
      await this.saveUserData({
        name: updateData.displayName,
        profileImage: updateData.photoURL,
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Obtém dados do usuário atual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Limpa todos os dados do usuário
   */
  async clearUserData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_EMAIL,
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.USER_PROFILE_IMAGE,
        STORAGE_KEYS.LAST_LOGIN,
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados do usuário:', error);
    }
  }

  /**
   * Destrói o serviço e remove listeners
   */
  destroy() {
    if (this.authStateListener) {
      this.authStateListener();
      this.authStateListener = null;
    }
  }
}

// Exporta uma instância singleton
export default new AuthService();