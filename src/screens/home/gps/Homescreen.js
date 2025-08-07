// HomeScreen.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FontAwesome } from "@expo/vector-icons";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import COLLECTIONS_KEYS from "../../../constants/collections";

export default function HomeScreen({ route, navigation }) {
  const loggedUser = auth().currentUser;

  const [polygons, setPolygons] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadPolygons = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await firestore()
        .collection(COLLECTIONS_KEYS.POLYGONS)
        .where("owner", "==", loggedUser.uid)
        .get();
      const parsedPolygons = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const ordered = parsedPolygons.sort((a,b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setPolygons(ordered);
    } catch (error) {
      console.error('Erro ao carregar áreas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as áreas salvas.');
    } finally {
      setIsLoading(false);
    }
  }, [loggedUser.uid]);

  const deletePolygon = useCallback((id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir esta área?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              await firestore().collection(COLLECTIONS_KEYS.POLYGONS).doc(id).delete();
              await loadPolygons();

              Alert.alert('Sucesso', 'Área deletada com sucesso.');
            } catch (error) {
              console.error('Erro ao deletar área:', error);
              Alert.alert('Erro', 'Não foi possível deletar a área.');
            }
          },
        },
      ]
    );
  }, [loadPolygons]);

  const renderItem = useCallback(({ item }) => (
    <View style={styles.polygonItem}>
      <TouchableOpacity
        style={styles.polygonInfo}
        onPress={() => navigation.navigate("MapScreen", { polygonToEdit: item })}
      >
        <View>
          <Text style={styles.polygonText}>{item.name}</Text>
          <Text style={styles.polygonArea}>Área: {item.area} ha</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deletePolygon(item.id)}>
        <Icon name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  ), [deletePolygon, navigation]);
  

  useEffect(() => {
    const initializePolygons = async () => {
      await loadPolygons();
    };
    initializePolygons();
  }, []);

  useEffect(() => {
    const updatePolygons = async () => {
      if (route.params?.newArea) {
        await loadPolygons();
      }
    };
    
    updatePolygons();
  }, [loadPolygons, route.params?.newArea]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


  const filteredPolygons = useMemo(() => polygons.filter((item) =>
    item.name?.toLowerCase().includes(searchText.toLowerCase())
  ), [polygons, searchText]);


  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.headerText}>Áreas Salvas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("MapScreen")}
        >
          <FontAwesome name="plus" size={24} color="#058301" />
          </TouchableOpacity>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Carregando áreas...</Text>
      ) : (
        <>
          
          {/* Barra de busca */}
          <TextInput
            style={styles.searchBar}
            placeholder="Buscar áreas..."
            value={searchText}
            onChangeText={setSearchText}
          />

          {/* Lista de áreas salvas */}
          {filteredPolygons.length > 0 ? (
            <FlatList
              data={filteredPolygons}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
            />
          ) : (
            <Text style={styles.emptyMessage}>Nenhuma área salva ainda.</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    backgroundColor: '#058301',
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#fff',
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    backgroundColor: "#f1f1f1",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
  },
  polygonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  polygonInfo: {
    flex: 1,
  },
  polygonText: {
    fontSize: 18,
    fontWeight: 900,
    color: '#555',
    marginBottom: 4,
  },
  polygonArea: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#004B00",
    textAlign: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 20,
    color: "#004B00",
    textAlign: "center",
  },
});