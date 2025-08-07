//MapScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  TextInput,
  ToastAndroid,
} from "react-native";
import LeafletMapView from "../../../components/LeafletMapView";
import * as Location from "expo-location";
import * as turf from "@turf/turf";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getUUID } from "../../../utils/randomId";
import * as FileSystem from 'expo-file-system';
import { styles } from "./MapScreenStyles";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import COLLECTIONS_KEYS from "../../../constants/collections";

const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MapScreen = ({ navigation, route }) => {
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [region, setRegion] = useState(null);
  const [area, setArea] = useState(0); // Inicializado como 0 para evitar undefined
  const [areaCenter, setAreaCenter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [mapLayer, setMapLayer] = useState("street"); // "street" ou "satellite"
  const [sideLengths, setSideLengths] = useState([]); // Comprimentos dos lados
  const [conversionModalVisible, setConversionModalVisible] = useState(false);
  const mapRef = useRef(null);

  const loggedUser = auth().currentUser;

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão Negada",
            "Permissões de localização são necessárias para usar o mapa."
          );
          setRegion(DEFAULT_REGION);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(initialRegion);
      } catch (error) {
        console.error("Erro ao obter localização:", error);
        setRegion(DEFAULT_REGION);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (route.params?.polygonToEdit) {
      const { coords, name } = route.params.polygonToEdit;
      setPolygonCoords(coords);
      setAreaName(name);
      calculateAreaAndSides(coords);
      if (coords.length > 0) {
        const { latitude, longitude } = coords[0];
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
      }
    }
  }, [route.params?.polygonToEdit]);

const toggleMapLayer = () => {
  setMapLayer((prevLayer) => {
    const newLayer = prevLayer === "street" ? "satellite" : "street";
    return newLayer;
  });

  if (mapRef.current) {
    mapRef.current.toggleMapLayer(
      mapLayer === "street" ? "satellite" : "street"
    );
  }
};

  const calculateAreaAndSides = (coords) => {
    if (coords.length < 3) return;

    // Calcular a área
    const closedPolygonCoords = [...coords, coords[0]];
    const turfPolygon = turf.polygon([
      closedPolygonCoords.map((coord) => [coord.longitude, coord.latitude]),
    ]);
    const calculatedArea = turf.area(turfPolygon) / 10000; // Área em hectares
    setArea(calculatedArea.toFixed(2));

    // Calcular o centro do polígono
    const centroid = turf.centroid(turfPolygon);
    setAreaCenter({
      latitude: centroid.geometry.coordinates[1],
      longitude: centroid.geometry.coordinates[0],
    });

    // Calcular o comprimento de cada lado (em metros)
    const lengths = [];
    for (let i = 0; i < coords.length; i++) {
      const start = coords[i];
      const end = coords[(i + 1) % coords.length];
      const lengthInMeters = turf.distance(
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
        { units: "kilometers" }
      ) * 1000; // Converte km para m
      lengths.push(Math.round(lengthInMeters));
    }
    setSideLengths(lengths);
  };

  const centerMapOnDevice = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.centerMap(newRegion);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter a localização do dispositivo.");
    }
  };

  const clearPolygon = () => {
    setPolygonCoords([]);
    setArea(0); // Resetar área para 0
    setAreaCenter(null);
    setSideLengths([]);
    ToastAndroid.show("Polígono limpo!", ToastAndroid.SHORT);
    if (mapRef.current) {
      mapRef.current.clearPolygon();
    }
  };

  const openSaveModal = () => {
    if (polygonCoords.length < 3) {
      Alert.alert("Erro", "O polígono precisa de pelo menos 3 pontos.");
      return;
    }
    setModalVisible(true);
  };

  const saveArea = async () => {
    if (!areaName.trim()) {
      Alert.alert("Erro", "O nome da área não pode estar vazio.");
      return;
    }

    const areaRecordId = route.params?.polygonToEdit?.id ?? getUUID();
    const areaRecord = { 
      id: areaRecordId,
      name: areaName.trim(), 
      coords: polygonCoords,
      area,
      owner: loggedUser.uid,
      updatedAt: new Date(),
    };

    try {
      await firestore().collection(COLLECTIONS_KEYS.POLYGONS).doc(areaRecordId).set(areaRecord);

      Alert.alert('Sucesso', 'Área salva com sucesso.');

      setModalVisible(false);
      setAreaName("");
      
      navigation.navigate("Home", { newArea: true });
    } catch (error) {
      console.error('Erro ao salvar área:', error);
      Alert.alert('Erro', 'Não foi possível salvar a área.');
    }
  };

  const addPolygonCoord = (coordinate) => {
    const updatedCoords = [...polygonCoords, coordinate];
    setPolygonCoords(updatedCoords);
    ToastAndroid.show("Ponto adicionado!", ToastAndroid.SHORT);
    if (updatedCoords.length >= 3) calculateAreaAndSides(updatedCoords);
  };

  const startMeasuring = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          addPolygonCoord({ latitude, longitude });
        }
      );
      setLocationSubscription(subscription);
      setIsMeasuring(true);
      Alert.alert("Medição Iniciada", "O modo de medição está ativo.");
    } catch (error) {
      console.error("Erro ao iniciar medição:", error);
      Alert.alert("Erro", "Não foi possível iniciar o modo de medição.");
    }
  };

  const stopMeasuring = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsMeasuring(false);
    Alert.alert("Medição Finalizada", "O modo de medição foi desativado.");
  };

  const convertArea = (unit) => {
    if (typeof area !== 'number' || isNaN(area)) {
      ToastAndroid.show("Erro: Área inválida.", ToastAndroid.SHORT);
      return;
    }
  
    let convertedArea;
    let areaInSquareMeters = area; // Assumindo que area já está em m²
  
    switch (unit) {
      case "hectares":
        convertedArea = areaInSquareMeters / 10000; // Converte m² para hectares
        break;
      case "m²":
        convertedArea = areaInSquareMeters; // Já está em m²
        break;
      case "km²":
        convertedArea = areaInSquareMeters / 1e6; // Converte m² para km²
        break;
      default:
        convertedArea = areaInSquareMeters;
    }
  
    setArea(parseFloat(convertedArea).toFixed(2)); // Atualiza o estado
  
    ToastAndroid.show(`Área convertida para ${unit}: ${convertedArea.toFixed(2)}`, ToastAndroid.SHORT);
  };
  
  const convertSides = (unit) => {
    const convertedSides = sideLengths.map((length) => {
      const lengthInMeters = parseFloat(length);
      return unit === "km" ? lengthInMeters / 1000 : lengthInMeters * 1000;
    });
  
    setSideLengths(convertedSides);
  
    ToastAndroid.show(`Lados convertidos para ${unit}`, ToastAndroid.SHORT);
  };
  

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LeafletMapView
        ref={mapRef}
        region={region}
        polygonCoords={polygonCoords}
        mapLayer={mapLayer}
        onMapClick={(coordinate) => addPolygonCoord(coordinate)}
        areaCenter={areaCenter}
        area={area}
        sideLengths={sideLengths}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.circleButton} onPress={centerMapOnDevice}>
          <Icon name="crosshairs-gps" size={30} color="#058301" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton} onPress={clearPolygon}>
          <Icon name="delete" size={30} color="#058301" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton} onPress={openSaveModal}>
          <Icon name="content-save" size={30} color="#058301" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circleButton,
            isMeasuring ? styles.measureButtonActive : null,
          ]}
          onPress={isMeasuring ? stopMeasuring : startMeasuring}
        >
          <Icon name="tape-measure" size={24} color={isMeasuring ? "#fff" : "#058301"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton} onPress={() => setConversionModalVisible(true)}>
          <Icon name="swap-horizontal" size={24} color="#058301" />
        </TouchableOpacity>
      </View>

      <View style={styles.layerContainer}>
        <TouchableOpacity onPress={toggleMapLayer} style={styles.layerButton}>
          <Icon
            name={mapLayer === "street" ? "map" : "satellite-variant"}
            size={30}
            color="#058301"
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Defina o nome da área</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome da área"
              value={areaName}
              onChangeText={setAreaName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#058301" }]}
                onPress={() => {
                  setModalVisible(false);
                  setAreaName("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#058301" }]}
                onPress={saveArea}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={conversionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConversionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Converter Unidades</Text>

            {/* Seção Área */}
            <Text style={styles.sectionTitle}>Área</Text>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => convertArea("hectares")}
              >
                <Text style={styles.optionText}>Hectares</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => convertArea("m²")}
              >
                <Text style={styles.optionText}>Metros Quadrados (m²)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => convertArea("km²")}
              >
                <Text style={styles.optionText}>Quilômetros Quadrados (km²)</Text>
              </TouchableOpacity>
            </View>

            {/* Seção Lados */}
            <Text style={styles.sectionTitle}>Lados</Text>
            <View style={styles.optionContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => convertSides("m")}
              >
                <Text style={styles.optionText}>Metros (m)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => convertSides("km")}
              >
                <Text style={styles.optionText}>Quilômetros (km)</Text>
              </TouchableOpacity>
            </View>

            {/* Botão Fechar */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setConversionModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MapScreen;
