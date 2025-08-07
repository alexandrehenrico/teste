import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOGETHER_API_KEY = '0c65096dd56054a601639be0ac9703485fe2b08723f4affb426fdcee6b205a74';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Olá! Como posso te ajudar com suas dúvidas?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const saveMessages = async (messages) => {
    try {
      await AsyncStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error('Erro ao salvar mensagens:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem('chatHistory');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };
 



  const handleSend = async () => {
    if (inputText.trim()) {
      if (editingMessage) {
        const updatedMessages = messages.map((msg) =>
          msg.id === editingMessage.id ? { ...msg, text: inputText } : msg
        );
        setMessages(updatedMessages);
        saveMessages(updatedMessages);
        setEditingMessage(null);
        const botResponse = await fetchBotResponse(inputText);
        const updatedMessagesWithBot = [
          ...updatedMessages.filter((msg) => msg.sender !== 'bot' || msg.id !== editingMessage.id + 1),
          { id: editingMessage.id + 1, text: botResponse, sender: 'bot' }
        ];
        setMessages(updatedMessagesWithBot);
        saveMessages(updatedMessagesWithBot);
      } else {
        const newMessage = { id: messages.length + 1, text: inputText, sender: 'user' };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        saveMessages(updatedMessages);
        setInputText('');

        const botResponse = await fetchBotResponse(inputText);
        const updatedMessagesWithBot = [...updatedMessages, { id: updatedMessages.length + 1, text: botResponse, sender: 'bot' }];
        setMessages(updatedMessagesWithBot);
        saveMessages(updatedMessagesWithBot);
      }
      setInputText('');
    }
  };

  const fetchBotResponse = async (userMessage) => {
    try {
      console.log("Enviando mensagem para Together.ai:", userMessage);
      const response = await axios.post(
        'https://api.together.xyz/v1/chat/completions',
        {
          model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
          messages: [
            { role: 'system', content: 'Você é um assistente especializado em agropecuária.' },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 1000,  
          temperature: 0.7,
          top_p: 0.9 
        },
        {
          headers: {
            'Authorization': `Bearer ${TOGETHER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Resposta da Together.ai:", response.data);
      return response.data.choices[0].message.content || "Não consegui entender sua pergunta.";

    } catch (error) {
      console.error("Erro ao obter resposta da Together.ai:", error.response ? error.response.data : error.message);
      return 'Desculpe, houve um erro ao obter a resposta.';
    }
  };

  const handleDeleteChat = () => {
    setMessages([{ id: 1, text: 'Olá! Como posso te ajudar com suas dúvidas?', sender: 'bot' }]);
    AsyncStorage.removeItem('chatHistory');
  };
  const copyToClipboard = (text) => {
    Clipboard.setStringAsync(text);
    ToastAndroid.show('Resposta copiada!', ToastAndroid.SHORT);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ChatBot Finagro</Text>
        <TouchableOpacity onPress={handleDeleteChat}
        style={styles.ExcluirButton}>
          <Ionicons name='trash' size={24} color='#058301' />
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === 'bot' ? styles.botMessage : styles.userMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
            {item.sender === 'user' && (
              <TouchableOpacity onPress={() => { setInputText(item.text); setEditingMessage(item); }}>
          <Icon name="edit" size={20} color="#fff" />
              </TouchableOpacity>
            )}
            {item.sender === 'bot' && (
              <TouchableOpacity onPress={() => copyToClipboard(item.text)}>
                <Ionicons name='copy' size={20} color='white' style={styles.copyIcon} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder='Digite sua mensagem...'
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name='send' size={24} color='white' />
        </TouchableOpacity>
      </View>
    </View>
    
   
  );

  

 
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  ExcluirButton: { justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white'
  },
  message: { padding: 10, borderRadius: 10, marginVertical: 10, maxWidth: '80%', margin: 15, flexDirection: 'row', alignItems: 'center' },
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#006414' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#058301' },
  messageText: { fontSize: 16, color: '#fff', flex: 1 },
  editIcon: { marginLeft: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#DDD' },
  input: { flex: 1, padding: 10, fontSize: 16, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, marginRight: 10 },
  sendButton: { padding: 10, backgroundColor: '#058301', borderRadius: 100 },
  header: { backgroundColor: '#058301', paddingVertical: 15, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});

export default ChatBot;
