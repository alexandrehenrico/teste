import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Dados para o gráfico
const priceData = [
  { mes: 'Jan', preco: 210 },
  { mes: 'Fev', preco: 220 },
  { mes: 'Mar', preco: 200 },
  { mes: 'Abr', preco: 230 },
  { mes: 'Mai', preco: 240 },
  { mes: 'Jun', preco: 250 },
  { mes: 'Jul', preco: 260 },
  { mes: 'Ago', preco: 245 },
  { mes: 'Set', preco: 250 },
  { mes: 'Out', preco: 270 },
  { mes: 'Nov', preco: 280 },
  { mes: 'Dez', preco: 290 },
];

// Função para gerar o caminho do gráfico
const generatePath = () => {
  const maxPrice = Math.max(...priceData.map(data => data.preco));
  const minPrice = Math.min(...priceData.map(data => data.preco));
  const range = maxPrice - minPrice;
  const padding = 20;

  return priceData
    .map((data, index) => {
      const x = (index / (priceData.length - 1)) * (width - padding * 2) + padding;
      const y = ((maxPrice - data.preco) / range) * 150 + padding;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const App = () => {
  const maxPrice = Math.max(...priceData.map(data => data.preco));
  const minPrice = Math.min(...priceData.map(data => data.preco));

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#208c1c" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Análise de Preços do Gado</Text>
        <Text style={styles.headerSubText}>
          Saiba o melhor momento para comprar e vender
        </Text>
      </View>

      {/* Gráfico de linhas */}
      <View style={styles.chartBackground}>
        <Svg height="200" width={width}>
          {/* Linhas horizontais */}
          {[...Array(5).keys()].map(index => (
            <Line
              key={index}
              x1="0"
              y1={(index / 4) * 150 + 20}
              x2={width}
              y2={(index / 4) * 150 + 20}
              stroke="#ffffff44"
              strokeWidth="1"
            />
          ))}

          {/* Caminho do gráfico */}
          <Path
            d={generatePath()}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
          />
          {/* Círculos para pontos */}
          {priceData.map((data, index) => {
            const range = maxPrice - minPrice;
            const padding = 20;
            const x = (index / (priceData.length - 1)) * (width - padding * 2) + padding;
            const y = ((maxPrice - data.preco) / range) * 150 + padding;
            return <Circle key={index} cx={x} cy={y} r="4" fill="#ffffff" />;
          })}
        </Svg>
      </View>

      {/* Informações detalhadas */}
      <View style={styles.infoContainer}>
        {priceData.map((data, index) => (
          <View key={index} style={styles.infoRow}>
            <Text style={styles.infoMonth}>{data.mes}</Text>
            <Text style={styles.infoPrice}>R$ {data.preco.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Análise */}
      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>Momento Ideal</Text>
        <Text style={styles.analysisText}>
          - Melhor momento para comprar: Março, com preço de R$ 200.
        </Text>
        <Text style={styles.analysisText}>
          - Melhor momento para vender: Dezembro, com preço de R$ 290.
        </Text>
        <Text style={styles.analysisText}>
          Baseado em dados históricos, o preço tende a subir no segundo semestre.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    backgroundColor: '#058301',
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: '#208c1c',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubText: {
    fontSize: 14,
    color: '#d9f5e1',
    marginTop: 4,
  },
  chartBackground: {
    marginVertical: 20,
    marginHorizontal: 5,
    padding: 16,
    backgroundColor: '#208c1c',
    borderRadius: 8,
    overflow: 'hidden',
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  infoMonth: {
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
  },
  infoPrice: {
    fontSize: 16,
    color: '#208c1c',
    fontWeight: 'bold',
  },
  analysisContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#eaf8ed',
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#208c1c',
  },
  analysisText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
});

export default App;