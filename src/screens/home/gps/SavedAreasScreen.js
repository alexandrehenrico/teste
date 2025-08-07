//.SavedAreasScreen.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function SavedAreasScreen({ route, navigation }) {
  const { polygons } = route.params;

  const navigateToMap = (polygon) => {
    navigation.navigate("MapScreen", { polygonToEdit: polygon });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Áreas Salvas</Text>
      {polygons.length > 0 ? (
        <FlatList
          data={polygons}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.polygonItem}>
              <TouchableOpacity
                style={styles.polygonInfo}
                onPress={() => navigateToMap(item)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.previewImage}
                />
                <View>
                  <Text style={styles.polygonText}>{item.name}</Text>
                  <Text style={styles.polygonArea}>
                    Área: {item.area} ha
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyMessage}>Nenhuma área salva ainda.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9F9F9" },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  polygonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  polygonInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  polygonText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  polygonArea: { fontSize: 14, color: "#666" },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginVertical: 20,
  },
});