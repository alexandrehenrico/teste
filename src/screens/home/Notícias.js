import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import { FontAwesome } from '@expo/vector-icons';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ScrollView, 
  Image 
} from 'react-native';
import axios from 'axios';
import { Linking } from 'react-native';

import styles from './Notícias.styles.js'; // importação do estilo


const NewsItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.newsItem} onPress={() => onPress(item)}>
    <Image source={{ uri: item.image }} style={styles.newsImage} />
    <Text style={styles.newsTitle}>{item.title}</Text>
  </TouchableOpacity>
);

const ModalContent = ({ news, onClose }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={!!news}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Image source={{ uri: news.image }} style={styles.modalImage} />
        <ScrollView style={styles.modalScrollView}>
          <Text style={styles.modalTitle}>{news.title}</Text>
          <Text style={styles.modalText}>{news.fullText}</Text>
        </ScrollView>
        <View style={styles.modalButtonsContainer}>
          {news.url && (
            <TouchableOpacity
              onPress={() => Linking.openURL(news.url)}
              style={styles.readMoreButton}
            >
              <Text style={styles.buttonText}>Ler Notícia Completa</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function Noticias() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const API_KEY = '93ee93f998d346e29ff6e3a455885111';
  const BASE_URL = `https://newsapi.org/v2/everything`;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNews = async (isLoadMore = false, isRefresh = false) => {
    setError(null);
    
    if (isRefresh) {
      setIsRefreshing(true); // Ativa o estado de atualização
    } else if (!isLoadMore) {
      setLoading(true);
    }
  
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          q: '(agronegócio OR agro OR pecuária OR agricultura OR rural OR fazenda)',
          apiKey: API_KEY,
          language: 'pt',
          page: isLoadMore ? page : 1,
          pageSize: 10,
        },
      });
  
      const articles = response.data.articles.map((article, index) => ({
        id: `${page}-${index}`,
        title: article.title || 'Título não disponível',
        description: article.description || 'Descrição não disponível',
        fullText: article.content || 'Texto completo não disponível.',
        url: article.url || '',
        image: article.urlToImage || 'https://via.placeholder.com/150',
        publishedAt: new Date(article.publishedAt || Date.now()),
      }));
  
      const sortedArticles = articles.sort((a, b) => b.publishedAt - a.publishedAt);
  
      setNews((prev) => (isLoadMore ? [...prev, ...sortedArticles] : sortedArticles));
    } catch (err) {
      const errorMessage = err.response
        ? `Erro ${err.response.status}: ${err.response.data.message || 'Erro ao buscar notícias.'}`
        : err.request
        ? 'Erro de rede. Verifique sua conexão.'
        : 'Ocorreu um erro.';
      setError(errorMessage);
    } finally {
      if (!isLoadMore) setLoading(false);
      setIsFetchingMore(false);
      if (isRefresh) setIsRefreshing(false); // Desativa o estado de atualização
    }
  };

  const handleRefresh = () => {
    if (!isRefreshing) {
      fetchNews(false, true); // Passa isRefresh como true
    }
  };
  
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
    },
    []
  );

  const filteredNews = useMemo(
    () =>
      news.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [news, searchQuery]
  );

  const loadMoreNews = () => {
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (isFetchingMore) {
      fetchNews(true);
    }
  }, [isFetchingMore]);

  useEffect(() => {
    fetchNews();

    const intervalId = setInterval(() => {
      fetchNews();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleNewsClick = (item) => {
    setSelectedNews(item);
  };

  const handleCloseModal = () => {
    setSelectedNews(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#004B00" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchNews()}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

<View style={styles.header}>
      <Text style={styles.headerText}>Finagro Notícias</Text>
      <TouchableOpacity 
  style={styles.refreshButton} 
  onPress={handleRefresh} 
  disabled={isRefreshing} 
  accessibilityLabel="Atualizar notícias"
>
  {isRefreshing ? (
    <ActivityIndicator size="small" color="#fff" />
  ) : (
    <FontAwesome name="refresh" size={24} color="#058301" />
  )}
</TouchableOpacity>
    </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar Notícias..."
        value={searchQuery}
        onChangeText={handleSearch}
      />


    <FlatList
      data={filteredNews}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NewsItem item={item} onPress={handleNewsClick} />}
      onEndReached={loadMoreNews}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingMore && <ActivityIndicator size="small" color="#004B00" />}
      refreshing={isRefreshing} // Adiciona o pull-to-refresh
      onRefresh={handleRefresh} // Atualiza ao puxar para baixo
   />

      {selectedNews && <ModalContent news={selectedNews} onClose={handleCloseModal} />}
    </View>
  );
}


