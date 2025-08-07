/**
 * Contexto de Autenticação
 * Fornece estado global de autenticação para toda a aplicação
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AuthService from './AuthService';
import auth from '@react-native-firebase/auth';

// Estados possíveis da autenticação
const AUTH_STATES = {
  LOADING: 'LOADING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  ERROR: 'ERROR',
};

// Ações do reducer
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  authState: AUTH_STATES.LOADING,
};

// Reducer para gerenciar estado de autenticação
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
        authState: AUTH_STATES.LOADING,
      };

    case AUTH_ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        authState: AUTH_STATES.AUTHENTICATED,
      };

    case AUTH_ACTIONS.SET_UNAUTHENTICATED:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        authState: AUTH_STATES.UNAUTHENTICATED,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        authState: AUTH_STATES.ERROR,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Contexto
const AuthContext = createContext();

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Inicializa o serviço de autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING });

        // Monitora mudanças no estado de autenticação
        const unsubscribe = auth().onAuthStateChanged(async (user) => {
          if (user) {
            // Usuário autenticado
            try {
              // Carrega dados adicionais do usuário
              const userData = await AuthService.loadUserData();
              
              const enrichedUser = {
                ...user,
                ...userData,
              };

              dispatch({ 
                type: AUTH_ACTIONS.SET_AUTHENTICATED, 
                payload: enrichedUser 
              });
            } catch (error) {
              console.error('Erro ao carregar dados do usuário:', error);
              dispatch({ 
                type: AUTH_ACTIONS.SET_AUTHENTICATED, 
                payload: user 
              });
            }
          } else {
            // Usuário não autenticado
            dispatch({ type: AUTH_ACTIONS.SET_UNAUTHENTICATED });
          }
        });

        // Cleanup function
        return unsubscribe;
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        dispatch({ 
          type: AUTH_ACTIONS.SET_ERROR, 
          payload: 'Falha na inicialização da autenticação' 
        });
      }
    };

    const unsubscribe = initializeAuth();
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
      AuthService.destroy();
    };
  }, []);

  // Funções de autenticação
  const signIn = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      const user = await AuthService.signInWithEmail(email, password);
      // O estado será atualizado automaticamente pelo onAuthStateChanged
      return user;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  const signUp = async (email, password, name) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      const user = await AuthService.signUpWithEmail(email, password, name);
      // O estado será atualizado automaticamente pelo onAuthStateChanged
      return user;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  const signInWithGoogle = async (config) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      const user = await AuthService.signInWithGoogle(config);
      // O estado será atualizado automaticamente pelo onAuthStateChanged
      return user;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      await AuthService.signOut();
      // O estado será atualizado automaticamente pelo onAuthStateChanged
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      await AuthService.sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await AuthService.updatePassword(newPassword);
      return true;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      await AuthService.updateProfile(profileData);
      
      // Atualiza o estado local
      const updatedUser = {
        ...state.user,
        displayName: profileData.displayName || state.user.displayName,
        photoURL: profileData.photoURL || state.user.photoURL,
      };

      dispatch({ 
        type: AUTH_ACTIONS.SET_AUTHENTICATED, 
        payload: updatedUser 
      });

      return true;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Valor do contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Funções
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
    clearError,
    
    // Utilitários
    validateEmail: AuthService.validateEmail,
    validatePassword: AuthService.validatePassword,
    validateName: AuthService.validateName,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// Exporta o contexto para casos especiais
export { AuthContext };