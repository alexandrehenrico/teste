//HomeScreen.js
import React, { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import styles from './HomeScreen.styles.js'; // importação do estilo
import useGoogleSheetData from 'use-google-sheet-data/App';
import { useNavigation } from '@react-navigation/native'; 

const API_KEY = process.env.OPENWEATHER_API_KEY || '062b404fb431b7511852d2d57f728357';
const SHEET_API_KEY = "AIzaSyD36C-k9xtxWnkzTv5RxZIf-rqyAtLWed4";
const SPREADSHEET_ID = "1ND0uPKjC1WQYCZJoxAtD-A4f1zMqijXw6z36Cs-8hhc";
const RANGE = "Preços!A1:B10"; 

export default function HomeScreen() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({});
  const [cotacoes, setCotacoes] = useState({ gado: null, milho: null, soja: null, dolar: null });
  const { data, loading: loadingCotacoes } = useGoogleSheetData(SHEET_API_KEY, SPREADSHEET_ID, RANGE);

  useEffect(() => {
    if (data && data.length > 0) {
      const novasCotacoes = { ...cotacoes };
      data.forEach(([produto, preco]) => {
        const nomeNormalizado = produto.toLowerCase();
        if (nomeNormalizado === 'boi gordo') novasCotacoes.gado = preco;
        if (nomeNormalizado === 'milho') novasCotacoes.milho = preco;
        if (nomeNormalizado === 'soja') novasCotacoes.soja = preco;
        if (nomeNormalizado === 'dolar') novasCotacoes.dolar = preco;
      });
      setCotacoes(novasCotacoes);
    }
  }, [data]);
  
  const navigation = useNavigation(); // 👈 Hook para navegação

  const getWeatherByCity = async () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      Alert.alert('Erro', 'Por favor, insira o nome da cidade.');
      return;
    }

    if (cache[trimmedCity]) {
      setWeatherData(cache[trimmedCity]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: trimmedCity,
            appid: API_KEY,
            units: 'metric',
            lang: 'pt_br',
          },
        }
      );
      setWeatherData(response.data);
      setCache((prevCache) => ({ ...prevCache, [trimmedCity]: response.data }));
    } catch (error) {
      console.error('Erro ao buscar dados do clima:', error.response || error.message);
      Alert.alert('Erro', 'Não foi possível obter os dados do clima. Verifique o nome da cidade.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login'); // 👈 Redireciona para a tela de login
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };


  const handleMeusDados = () => {
    navigation.navigate('Profile');
  };

  const WeatherCard = ({ weatherData }) => (
    <View style={styles.weatherCard} accessible accessibilityLabel="Cartão de clima">
      <FontAwesome5 
  name="cloud" 
  size={70} 
  color="#fff" 
  style={{ marginLeft: 5, marginRight: 15 }}  // Margem de 10px em ambos os lados
/>
      <View>
        <Text style={styles.weatherText}>{weatherData.main.temp}°C</Text>
        <Text style={styles.weatherDescription}>{weatherData.weather[0].description}</Text>
        <Text style={styles.weatherLocation}>
          {weatherData.name}, {weatherData.sys.country}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
    {/* Header fixo */}
    <View style={styles.headercontainer}>
    <View style={styles.header}>
      <Text style={styles.greeting}>Olá, Produtor!</Text>
      <TouchableOpacity
        style={styles.meusDadosButton}
        onPress={handleMeusDados}
        accessible
        accessibilityLabel="Botão para acessar seus dados pessoais"
      >
        <Text style={styles.meusDadosText}>Meus Dados</Text>
      </TouchableOpacity>
    </View>
    </View>

    
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Digite o nome da cidade"
          placeholderTextColor={'#aaa'}
          value={city}
          onChangeText={setCity}
          accessible
          accessibilityLabel="Campo de texto para inserir o nome da cidade"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={getWeatherByCity}
          accessible
          accessibilityLabel="Botão para buscar dados climáticos da cidade inserida"
        >
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer} accessible accessibilityLabel="Carregando dados climáticos">
          <ActivityIndicator size="large" color={'#058301'}
           style={styles.spinner} />
          <Text style={styles.loadingText}>Buscando informações climáticas...</Text>
        </View>
      ) : weatherData ? (
        <WeatherCard weatherData={weatherData} />
      ) : (
        <Text style={styles.loadingText} accessible accessibilityLabel="Mensagem para inserir uma cidade para buscar o clima">
          Insira uma cidade para buscar o clima.
        </Text>
      )}

      <View style={styles.rowContainer}>
      <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('Propriedades')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de propriedades"
        >
          <MaterialCommunityIcons name="warehouse" size={50} color="#fff" />
          <Text style={styles.sectionText}>Propriedades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('Gestão de Animais')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de gestão de animais"
        >
          <MaterialCommunityIcons name="cow" size={50} color="#fff" />
          <Text style={styles.sectionText}>Rebanho</Text>
        </TouchableOpacity>

 <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('RebanhoNavigator')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de gestão de animais"
        >
          <MaterialCommunityIcons name="fence" size={50} color="#fff" />
          <Text style={styles.sectionText}>Rebanho em Lote</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('Despesas')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de despesas"
        >
          <FontAwesome5 name="money-bill-wave" size={50} color="#fff" />
          <Text style={styles.sectionText}>Despesas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('Receitas')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de receitas"
        >
          <FontAwesome5 name="money-check-alt" size={50} color="#fff" />
          <Text style={styles.sectionText}>Receitas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('Mão De Obra')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de mão de obra"
        >
          <MaterialCommunityIcons name="tractor-variant" size={50} color="#fff" />
          <Text style={styles.sectionText}>Mão de Obra</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowContainer}>
        <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('Pagar')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de propriedades"
        >
          <MaterialCommunityIcons name="bank" size={50} color="#fff" />
          <Text style={styles.sectionText}>Contas</Text>
        </TouchableOpacity>

               <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('Trabalhadores')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de mão de obra"
        >
          <FontAwesome5 name="users" size={50} color="#fff" />
          <Text style={styles.sectionText}>Trabalhadores</Text>
        </TouchableOpacity>

<TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('GPS')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de GPS"
        >
          <FontAwesome5 name="map-marked-alt" size={50} color="#fff" />
          <Text style={styles.sectionText}>GPS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cotacoesContainer}>
        <Text style={styles.cotacaoTitle}>Cotações de Mercado</Text>
        {loadingCotacoes ? (
          <ActivityIndicator size="small" color="#058301" style={{ marginVertical: 10 }} />
        ) : (
          <>
            <View style={styles.cotacaoCard}>
              <Text style={styles.cotacaoLabel}>Arroba do Gado:</Text>
              <Text style={styles.cotacaoValue}>{cotacoes.gado ? `${cotacoes.gado}` : 'Não disponível'}</Text>
            </View>
            <View style={styles.cotacaoCard}>
              <Text style={styles.cotacaoLabel}>Milho:</Text>
              <Text style={styles.cotacaoValue}>{cotacoes.milho ? `${cotacoes.milho}` : 'Não disponível'}</Text>
            </View>
            <View style={styles.cotacaoCard}>
              <Text style={styles.cotacaoLabel}>Soja:</Text>
              <Text style={styles.cotacaoValue}>{cotacoes.soja ? `${cotacoes.soja}` : 'Não disponível'}</Text>
            </View>
            <View style={styles.cotacaoCard}>
              <Text style={styles.cotacaoLabel}>Dólar:</Text>
              <Text style={styles.cotacaoValue}>{cotacoes.dolar ? `${cotacoes.dolar}` : 'Não disponível'}</Text>
            </View>
            <Text style={styles.fonteLabel}>Fonte: noticiasagricolas.com.br</Text>
            <TouchableOpacity
          style={styles.sectionButtonSmall}
          onPress={() => navigation.navigate('Grafico')}
          accessible
          accessibilityLabel="Botão para navegar para a seção de grafico"
        >
          <Text style={[styles.sectionText, { fontSize: 15}]}>Ver Gráfico</Text>
        </TouchableOpacity>
          </>
        )}
      </View>
      <TouchableOpacity 
  style={styles.site}
  onPress={() => Linking.openURL('https://finagro.app')}
  accessible
  accessibilityLabel="Botão para acessar o site Finagro"
>
  <Image
    style={styles.imagesite}
    source={require("../../../assets/Site.png")} 
  />
</TouchableOpacity>
</ScrollView>
</View>

  );
};
