import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import CadAnimal from '../components/CadAnimal';

export default function DetalhesAnimal({ route, navigation }) {
    const { animal, onDelete, onUpdate, onDuplicate } = route.params;
    const [isEditing, setIsEditing] = useState(false);
    const [currentAnimal, setCurrentAnimal] = useState(animal);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateCount, setDuplicateCount] = useState('1');


    const handleDelete = () => {
        Alert.alert(
            'Excluir Animal',
            `Tem certeza que deseja excluir o animal "${currentAnimal.indAnimal}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sim',
                    onPress: () => {
                        onDelete(currentAnimal.id);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleSave = (updatedAnimal) => {
        onUpdate(updatedAnimal);
        setCurrentAnimal(updatedAnimal);
        setIsEditing(false);
    };

    const handleDuplicate = () => {
        const count = parseInt(duplicateCount, 10);
        if (isNaN(count) || count <= 0) {
            Alert.alert('Erro', 'Digite um número válido maior que 0.');
            return;
        }
        
        onDuplicate(currentAnimal, count); // Chama a função da tela principal
        setShowDuplicateModal(false);
        setDuplicateCount('1');
    
        Alert.alert('Animal Duplicado', `O animal "${currentAnimal.indAnimal}" foi duplicado ${count} vezes com sucesso!`);
    
        navigation.goBack(); // Retorna à tela principal para ver os animais duplicados
    };

    return (
        <View style={styles.container}>
            <ScrollView>

            <Text style={styles.label}>Identificação:</Text>
            <Text style={styles.value}>{currentAnimal.indAnimal}</Text>

            <Text style={styles.label}>Origem:</Text>
            <Text style={styles.value}>{currentAnimal.origem}</Text>

            <Text style={styles.label}>Raça:</Text>
            <Text style={styles.value}>{currentAnimal.raca}</Text>

            <Text style={styles.label}>Propriedade:</Text>
            <Text style={styles.value}>{currentAnimal.property}</Text>

            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.value}>{currentAnimal.desc}</Text>

            <Text style={styles.label}>Peso (KG):</Text>
            <Text style={styles.value}>{currentAnimal.peso} kg</Text>

            <Text style={styles.label}>Data de Nascimento:</Text>
            <Text style={styles.value}>{new Date(currentAnimal.data).toLocaleDateString('pt-BR')}</Text>

            <Text style={styles.label}>Sexo:</Text>
            <Text style={styles.value}>{currentAnimal.sexo}</Text>

            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                    <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
                    <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.duplicateButton]} onPress={() => setShowDuplicateModal(true)}>
                    <Text style={styles.buttonText}>Duplicar</Text>
                </TouchableOpacity>
            </View>
            {isEditing && (
                <CadAnimal
                    isVisible={isEditing}
                    onCancel={() => setIsEditing(false)}
                    onSave={handleSave}
                    animal={currentAnimal}
                />
            )}

        
            <Modal visible={showDuplicateModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text>Quantas cópias deseja criar?</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={duplicateCount}
                            onChangeText={setDuplicateCount}
                        />
                        <TouchableOpacity onPress={handleDuplicate}>
                            <Text>Duplicar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 20,
    },
    label: {
        fontSize: 20,
        fontWeight: '600',
        marginVertical: 6,
        color: '#4A4A4A',
    },
    value: {
        fontSize: 18,
        marginBottom: 10,
        color: '#585858',
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    duplicateButton: {
        backgroundColor: '#67C867',
    },
    deleteButton: {
        backgroundColor: '#FF6B6B',
    },
    editButton: {
        backgroundColor: '#FFC260',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginTop: 10,
        marginBottom: 20,
    },
});
