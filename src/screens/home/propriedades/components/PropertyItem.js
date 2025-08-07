import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PropertyItem({ property, onDelete, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{property.name}</Text>
        <Text style={styles.detail}>Gerente: {property.manager}</Text>
        <Text style={styles.detail}>Área: {property.area} Ha</Text>
        <Text style={styles.detail}>Município: {property.city}</Text>
        <Text style={styles.detail}>Valor Estimado: {property.valor}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={(event) => {
        event.stopPropagation();
        onDelete();
      }}>
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 10,
    borderRadius: 5,
  },
  deleteIcon: {
    color: 'red',
    fontSize: 18,
  },
});
