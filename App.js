import React, { useState, useEffect } from 'react';  
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import MainNavigator from './src/navegação/MainNavigator';
import LoginScreen from './src/screens/auth/LoginScreen';
import HomeStackNavigator from './src/navegação/HomeStackNavigator';
import { StyleSheet, StatusBar, SafeAreaView, ImageBackground, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { DataProvider } from './src/screens/home/DataContext'; 
import { ProfileProvider } from './src/screens/home/context/ProfileContext';
import CustomErrorFallback from './src/components/ErrorsFallback';
import ErrorBoundary from 'react-native-error-boundary';
import firestore from '@react-native-firebase/firestore';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true); // Novo estado para a splash screen
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  const uid = auth().currentUser?.uid;

  useEffect(() => {
    // Exibe a splash por 3 segundos antes de verificar a autenticação
    const splashTimer = setTimeout(() => {
      const unsubscribe = auth().onAuthStateChanged((user) => {
        setIsLoggedIn(!!user);
        setIsLoading(false);
      });
      setShowSplash(false);
      return unsubscribe;
    }, 5000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    firestore().settings({
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
      persistence: true,
    });

    if (!uid) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .collection('tasks')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const newTasks = [];
          snapshot.forEach(doc => {
            newTasks.push({ id: doc.id, ...doc.data() });
          });
          setTasks(newTasks);
          setIsOnline(true);
        },
        error => {
          console.error('Erro de conexão:', error);
          if (error.code === 'unavailable') {
            setIsOnline(false);
          }
        }
      );

    return () => unsubscribe();
  }, [uid]);

  const addTask = async () => {
    if (!taskText.trim() || !uid) return;
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .add({
          title: taskText,
          completed: false,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      setTaskText('');
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };

  const toggleComplete = async (taskId, currentValue) => {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .doc(taskId)
        .update({ completed: !currentValue });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .doc(taskId)
        .delete();
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  if (showSplash) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground 
          source={require('./assets/splash.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <StatusBar barStyle="light-content" backgroundColor="#004c01" />
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#004c01" />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={CustomErrorFallback}>
      <ProfileProvider>
        <DataProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#004c01" />
            <NavigationContainer>
              <Stack.Navigator>
                {isLoggedIn ? (
                  <>
                    <Stack.Screen
                      name="Main"
                      component={MainNavigator}
                      options={{ headerTransparent: true, headerShown: false }}
                    />
                    <Stack.Screen
                      name="Home"
                      options={{ headerTransparent: true, headerShown: false }}
                    >
                      {() => (
                        <SafeAreaView style={{ padding: 20 }}>
                          {/* Seu conteúdo principal */}
                          <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Gerenciador de Tarefas</Text>
                          {!isOnline && (
                            <Text style={{ color: 'red', marginBottom: 10 }}>
                              Sem conexão — dados sendo salvos localmente
                            </Text>
                          )}
                          <TextInput
                            placeholder="Nova tarefa"
                            value={taskText}
                            onChangeText={setTaskText}
                            style={{
                              borderWidth: 1,
                              borderColor: '#ccc',
                              padding: 10,
                              marginBottom: 10,
                              borderRadius: 5,
                            }}
                          />
                          <Button title="Adicionar Tarefa" onPress={addTask} />

                          <FlatList
                            data={tasks}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginBottom: 10,
                                  justifyContent: 'space-between',
                                  backgroundColor: '#f2f2f2',
                                  padding: 10,
                                  borderRadius: 5,
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => toggleComplete(item.id, item.completed)}
                                  style={{ flex: 1 }}
                                >
                                  <Text style={{ textDecorationLine: item.completed ? 'line-through' : 'none' }}>
                                    {item.title}
                                  </Text>
                                </TouchableOpacity>
                                <Button title="X" color="red" onPress={() => deleteTask(item.id)} />
                              </View>
                            )}
                          />
                        </SafeAreaView>
                      )}
                    </Stack.Screen>
                  </>
                ) : (
                  <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerTransparent: true, headerShown: false }}
                  />
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaView>
        </DataProvider>
      </ProfileProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  backgroundImage: {
    flex: 1, 
    width: '100%',  
    height: '100%',  
  },
});
