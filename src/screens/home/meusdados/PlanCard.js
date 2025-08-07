import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PlanCard = ({ icon, title, details, price, onSelect }) => (
  <View style={styles.planContainer}>
    <Text style={styles.planIcon}>{icon}</Text>
    <Text style={styles.planTitle}>{title}</Text>
    <Text style={styles.planDetails}>{details}</Text>
    <Text style={styles.planPrice}>{price}</Text>
    <TouchableOpacity style={styles.planButton} onPress={onSelect}>
      <Text style={styles.planButtonText}>Selecionar</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  planContainer: { 
    backgroundColor: '#ffffff',
    borderRadius: 12, // Borda mais suave
    padding: 20,
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
    borderColor: '#058301', // Cor verde mais suave para combinar com o tema
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5, // Sombra para Android
  },
  
  planIcon: {
    fontSize: 45, // Ícone um pouco maior para destacar
    marginBottom: 12,
  },
  
  planTitle: {
    fontSize: 22, // Aumenta a legibilidade
    fontWeight: 'bold',
    color: '#027A02', // Verde um pouco mais escuro para contraste
    marginBottom: 6,
    textAlign: 'center',
  },
  
  planDetails: {
    fontSize: 15, // Texto mais legível
    color: '#555', // Cinza mais suave para melhor leitura
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22, // Melhor espaçamento entre linhas
  },
  
  planPrice: {
    fontSize: 26, // Maior destaque no preço
    fontWeight: 'bold',
    color: '#C62828', // Vermelho menos saturado para melhor harmonia
    marginBottom: 18,
  },
  
  planButton: {
    backgroundColor: '#027A02', // Verde mais escuro para melhor contraste
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Sombra para Android
  },
  
  planButtonText: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: 'bold',
    textTransform: 'uppercase', // Torna o texto mais chamativo
    letterSpacing: 1, // Melhor espaçamento entre letras
  },
  });

export default PlanCard;
