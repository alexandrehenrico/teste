import auth from '@react-native-firebase/auth';
import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert, ScrollView, Modal, TextInput, TouchableWithoutFeedback} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CadAnimal from '../components/CadAnimal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { Checkbox } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useData } from '../../../DataContext';

class AnimaisCadastrados extends Component {
    state = {
        cadastrados: [],
        showCadAnimal: false,
        showDuplicateModal: false, // Novo estado para controlar a exibição da modal
        duplicateCount: '1', // Armazena a quantidade de cópias a serem feitas
        selectedAnimal: null, // Guarda o animal a ser duplicado
        selectedAnimals: [],
        isSelecting: false,
        showPropertyModal: false,
        properties: [],
        selectedProperty: '',
        showFilterModal: false,
        selectedSexo: '',
        selectedRaca: '',
        filteredCadastrados: [],
        selectAll: false,
        selectedProperties: {},
    };

    async componentDidMount() {    
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.loadCadastrados();
        });
        await this.loadCadastrados();   
    }

    componentWillUnmount() {
        if (this.focusListener) {
            this.focusListener();
        }
    }  



    saveCadastrados = async (cadastrados) => {
        try {
            await AsyncStorage.setItem('@cadastrados', JSON.stringify(cadastrados));
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    };

loadCadastrados = async () => {
    try {
        const currentUser = auth().currentUser;

        if (!currentUser) {
            console.log('Usuário não autenticado');
            return;
        }

        const snapshot = await firestore()
            .collection('animais')
            .where('userId', '==', currentUser.uid) // 🔍 filtro por usuário
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        this.setState({ cadastrados: data });
    } catch (error) {
        console.error('Erro ao carregar animais:', error);
    }
};


    changeProperty = () => {
        const { cadastrados, selectedAnimals, selectedProperty } = this.state;
        if (!selectedProperty) {
            Alert.alert('Erro', 'Selecione uma propriedade válida.');
            return;
        }

        const updatedCadastrados = cadastrados.map(animal =>
            selectedAnimals.includes(animal.id) ? { ...animal, property: selectedProperty } : animal
        );

        this.setState({ cadastrados: updatedCadastrados, showPropertyModal: false, selectedAnimals: [], isSelecting: false }, () => {
            this.saveCadastrados(updatedCadastrados);
        });
    };

    AddCadastro = (novoCadastro) => {
        const cadastrados = [...this.state.cadastrados];
        cadastrados.push({ ...novoCadastro, id: cadastrados.length + 1 });

        this.setState({ cadastrados, showCadAnimal: false }, () => {
            this.saveCadastrados(cadastrados);
        });
    };

   deleteAnimal = async (id) => {
    try {
        await firestore().collection('animais').doc(id).delete();
        this.loadCadastrados();
    } catch (error) {
        console.error('Erro ao deletar animal:', error);
    }
};


        // Nova função para abrir a modal e definir o animal a ser duplicado
    confirmDuplicate = (animal) => {
        this.setState({ showDuplicateModal: true, selectedAnimal: animal });
    };
    // Função para duplicar corretamente
    duplicateAnimal = async (animal, count) => {
    const numDuplicatas = parseInt(count, 10);
    if (isNaN(numDuplicatas) || numDuplicatas <= 0) {
        Alert.alert('Erro', 'Digite um número válido maior que 0.');
        return;
    }

    try {
        const batch = firestore().batch();
        const animaisRef = firestore().collection('animais');

        for (let i = 0; i < numDuplicatas; i++) {
            const newDocRef = animaisRef.doc();
            batch.set(newDocRef, {
                ...animal,
                data: animal.data instanceof Date ? animal.data : new Date(animal.data), // para garantir compatibilidade
                id: newDocRef.id,
            });
        }

        await batch.commit();
        Alert.alert('Animal Duplicado', `O animal "${animal.indAnimal}" foi duplicado ${numDuplicatas} vezes.`);
        this.loadCadastrados(); // atualiza lista
    } catch (error) {
        console.error('Erro ao duplicar animal:', error);
    }
};


    updateAnimal = async (updatedAnimal) => {
    try {
        await firestore().collection('animais').doc(updatedAnimal.id).set(updatedAnimal);
        this.loadCadastrados();
    } catch (error) {
        console.error('Erro ao atualizar animal:', error);
    }
};


    getTotalWeight = () => {
        return this.state.cadastrados.reduce((total, animal) => total + parseFloat(animal.peso || 0), 0);
    };

    groupByProperty = () => {
        const grouped = {};
        const animalsToRender = this.state.filteredCadastrados.length ? this.state.filteredCadastrados : this.state.cadastrados;
        
        animalsToRender.forEach((animal) => {
            const property = animal.property && animal.property.trim() ? animal.property : 'Sem Propriedade';
            if (!grouped[property]) grouped[property] = [];
            grouped[property].push(animal);
        });
        
        return grouped;
    };
    

    toggleSelection = (animal) => {
        const { selectedAnimals } = this.state;
        if (selectedAnimals.includes(animal.id)) {
            this.setState({ selectedAnimals: selectedAnimals.filter(id => id !== animal.id) }, () => {
                if (this.state.selectedAnimals.length === 0) {
                    this.setState({ isSelecting: false });
                }
                this.updateSelectedProperties();
            });
        } else {
            this.setState({ selectedAnimals: [...selectedAnimals, animal.id], isSelecting: true }, () => {
                this.updateSelectedProperties();
            });
        }
    };

    deleteSelectedAnimals = () => {
        Alert.alert(
            'Excluir Animais',
            'Tem certeza que deseja excluir todos os animais selecionados?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sim',
                    onPress: () => {
                        const { cadastrados, selectedAnimals } = this.state;
                        const novosCadastrados = cadastrados.filter(animal => !selectedAnimals.includes(animal.id));
                        this.setState({ cadastrados: novosCadastrados, selectedAnimals: [], isSelecting: false }, () => {
                            this.saveCadastrados(novosCadastrados);
                        });
                    },
                },
            ]
        );
    };

    renderSelectionHeader = () => {
        return (
            <View style={styles.selectionHeader}>
                <TouchableOpacity onPress={() => this.setState({ isSelecting: false, selectedAnimals: [] })}>
                    <FontAwesome name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.selectionText}>{this.state.selectedAnimals.length} selecionado(s)</Text>
                <TouchableOpacity onPress={this.selectAllAnimals}>
                <Icon name="select-all" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ showPropertyModal: true })}>
                    <Icon name="edit" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={this.deleteSelectedAnimals}>
                    <Icon name="delete" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };
    selectAllAnimals = () => {
        const { cadastrados, selectedAnimals } = this.state;
        const allSelected = selectedAnimals.length === cadastrados.length;

        if (allSelected) {
            this.setState({
                selectedAnimals: [],
                selectedProperties: {},
                isSelecting: false,
                selectAll: false
            });
        } else {
            const newSelectedAnimals = cadastrados.map(animal => animal.id);
            const newSelectedProperties = {};

            cadastrados.forEach(animal => {
                if (animal.property) {
                    newSelectedProperties[animal.property] = true;
                }
            });

            this.setState({
                selectedAnimals: newSelectedAnimals,
                selectedProperties: newSelectedProperties,
                isSelecting: true,
                selectAll: true
            });
        }
    };

    selectAllFromProperty = (property) => {
        const { isSelecting, selectedProperties, cadastrados } = this.state;
        if (!isSelecting) return;
        
        const propertyAnimals = cadastrados.filter(animal => animal.property === property).map(animal => animal.id);
        const newSelectedProperties = { ...selectedProperties };
        if (selectedProperties[property]) {
            newSelectedProperties[property] = false;
            this.setState(prevState => {
                const newSelectedAnimals = prevState.selectedAnimals.filter(id => !propertyAnimals.includes(id));
                return {
                    selectedAnimals: newSelectedAnimals,
                    isSelecting: newSelectedAnimals.length > 0,
                };
            }, this.updateSelectedProperties);
        } else {
            newSelectedProperties[property] = true;
            this.setState(prevState => ({
                selectedAnimals: [...new Set([...prevState.selectedAnimals, ...propertyAnimals])],
                isSelecting: true,
            }), this.updateSelectedProperties);
        }
        this.setState({ selectedProperties: newSelectedProperties });
    };

    updateSelectedProperties = () => {
        const { cadastrados, selectedAnimals } = this.state;
        const newSelectedProperties = {};

        cadastrados.forEach(animal => {
            if (animal.property) {
                const propertyAnimals = cadastrados.filter(a => a.property === animal.property).map(a => a.id);
                const allSelected = propertyAnimals.every(id => selectedAnimals.includes(id));
                newSelectedProperties[animal.property] = allSelected;
            }
        });

        this.setState({ selectedProperties: newSelectedProperties });
    };

    openFilterModal = () => {
        this.setState({ showFilterModal: true });
    };
    
    applyFilter = () => {
        const { cadastrados, selectedSexo, selectedRaca, selectedProperty } = this.state;
        const filtered = cadastrados.filter(animal => 
            (selectedSexo ? animal.sexo === selectedSexo : true) &&
            (selectedRaca ? animal.raca === selectedRaca : true) &&
            (selectedProperty ? animal.property === selectedProperty : true)
        );
        this.setState({ filteredCadastrados: filtered, showFilterModal: false });
    };
    
    clearFilter = () => {
        this.setState({ selectedSexo: '', selectedRaca: '', selectedProperty: '', filteredCadastrados: [], showFilterModal: false });
    };

    render() {
        const groupedAnimals = this.groupByProperty();
        const totalAnimais = this.state.filteredCadastrados.length || this.state.cadastrados.length;
        const pesoTotal = (this.state.filteredCadastrados.length ? this.state.filteredCadastrados : this.state.cadastrados)
            .reduce((total, animal) => total + parseFloat(animal.peso || 0), 0);
        const animalsToRender = this.state.filteredCadastrados.length || this.state.selectedSexo || this.state.selectedRaca
            ? this.state.filteredCadastrados
            : this.state.cadastrados;

        return (
            <>
                {this.state.isSelecting ? this.renderSelectionHeader() : (
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Rebanho</Text>
                        <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={this.openFilterModal} style={styles.filterButton}>
                            <FontAwesome name="filter" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => this.setState({ showCadAnimal: true })}
                            >
                            <FontAwesome name="plus" size={24} color="#058301" />
                        </TouchableOpacity>
                        </View>
                    </View>
                )}
                <SafeAreaView style={styles.container}>
                    <CadAnimal
                        isVisible={this.state.showCadAnimal}
                        onCancel={() => this.setState({ showCadAnimal: false })}
                        onSave={this.AddCadastro}
                        globalProperties={this.props.globalProperties}
                    />
        
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>Total de Animais: {totalAnimais}</Text>
                        <Text style={styles.summaryText}>Peso Total: {pesoTotal.toFixed(2)} kg</Text>
                    </View>
        
                    <ScrollView>
                        {Object.keys(groupedAnimals).map((property, index) => (
                            <View key={index} style={styles.propertyGroup}>
                                <View style={styles.propertyHeader}>
                                    <Text style={styles.propertyTitle}>{property} ({groupedAnimals[property].length})</Text>
                                    {this.state.isSelecting && (
                                     <Checkbox.Android
                                     status={this.state.selectedProperties[property] ? 'checked' : 'unchecked'}
                                     onPress={() => this.selectAllFromProperty(property)}
                                     color="#058301"
                                     style={styles.checkbox}
                                     />
                                    )}
                                </View>
                                {animalsToRender.filter(animal => animal.property === property).map((animal) => (
                                    <View key={animal.id} style={[
                                        styles.itemContainer,
                                        this.state.selectedAnimals.includes(animal.id) && styles.selectedItemContainer
                                        ]}>
                                        <TouchableOpacity
                                            style={[
                                                styles.item,
                                                this.state.selectedAnimals.includes(animal.id)
                                                    ? styles.selectedItem
                                                    : {},
                                            ]}
                                            onLongPress={() => this.toggleSelection(animal)}
                                            onPress={() => {
                                                if (this.state.isSelecting) {
                                                    this.toggleSelection(animal);
                                                } else {
                                                    this.props.navigation.navigate('Detalhes Animal', {
                                                        animal: animal,
                                                        onDelete: this.deleteAnimal,
                                                        onUpdate: this.updateAnimal,
                                                        onDuplicate: this.duplicateAnimal,
                                                    });
                                                }
                                            }}
                                        >
                                            <Text style={styles.text}>{animal.indAnimal}</Text>
                                            <Text style={styles.subtext}>Sexo: {animal.sexo}</Text>
                                            <Text style={styles.subtext}>Peso: {animal.peso} Kg</Text>
                                        </TouchableOpacity>
                                        <View style={styles.buttonGroup}>
                                            <TouchableOpacity
                                                style={styles.duplicateButton}
                                                onPress={() => this.confirmDuplicate(animal)}
                                            >
                                                <FontAwesome name="clone" size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() =>
                                                    Alert.alert(
                                                        'Excluir Animal',
                                                        `Tem certeza que deseja excluir o animal "${animal.indAnimal}"?`,
                                                        [
                                                            { text: 'Cancelar', style: 'cancel' },
                                                            {
                                                                text: 'Sim',
                                                                onPress: () => this.deleteAnimal(animal.id),
                                                            },
                                                        ]
                                                    )
                                                }
                                            >
                                                <Icon name="delete" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </ScrollView>

                    <Modal visible={this.state.showPropertyModal} transparent animationType="slide" onRequestClose={() => this.setState({ showPropertyModal: false })}>
                        <TouchableWithoutFeedback onPress={() => this.setState({ showPropertyModal: false })}>
                            <View style={styles.modalContainer}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalTitle}>Escolha a nova propriedade:</Text>
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={this.state.selectedProperty}
                                                onValueChange={(itemValue) => this.setState({ selectedProperty: itemValue })}
                                                style={{ width: '100%' }}
                                            >
                                                <Picker.Item label="Selecione uma propriedade" value="" />
                                                {this.props.globalProperties && this.props.globalProperties.length > 0 ? (
                                                    this.props.globalProperties.map((property, index) => (
                                                        <Picker.Item key={index} label={property.name} value={property.name} />
                                                    ))
                                                ) : (
                                                    <Picker.Item label="Nenhuma propriedade encontrada" value="" />
                                                )}
                                            </Picker>
                                        </View>
                                        <TouchableOpacity style={styles.confirmButton} onPress={this.changeProperty}>
                                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => this.setState({ showPropertyModal: false })}>
                                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    <Modal visible={this.state.showDuplicateModal} 
                    transparent 
                    animationType="slide"
                    onRequestClose={() => this.setState({ showDuplicateModal: false })}>
                        <TouchableWithoutFeedback onPress={() => this.setState({ showDuplicateModal: false })}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text>Quantas cópias deseja criar?</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={this.state.duplicateCount}
                                        onChangeText={(text) => this.setState({ duplicateCount: text })}
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.duplicateAnimal(this.state.selectedAnimal, this.state.duplicateCount);
                                            this.setState({ showDuplicateModal: false }); // Fecha o modal após duplicar
                                        }}>
                                        <Text>Mutiplicar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    <Modal 
                        visible={this.state.showFilterModal} 
                        transparent 
                        animationType="slide"
                        onRequestClose={() => this.setState({ showFilterModal: false })}>
                        <TouchableWithoutFeedback onPress={() => this.setState({ showFilterModal: false })}>
                            <View style={styles.modalContainer}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalContent}>
                                        <Text>Filtrar por Sexo:</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={this.state.selectedSexo}
                                                onValueChange={(itemValue) => this.setState({ selectedSexo: itemValue })}
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="Todos" value="" />
                                                <Picker.Item label="Macho" value="Macho" />
                                                <Picker.Item label="Fêmea" value="Fêmea" />
                                            </Picker>
                                        </View>

                                        <Text>Filtrar por Raça:</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={this.state.selectedRaca}
                                                onValueChange={(itemValue) => this.setState({ selectedRaca: itemValue })}
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="Todas" value="" />
                                                {["ABERDEEN", "ANGUS BLACK", "ANGUS RED", "BONSMARA", "BRAFORD", "BRAHMAN",
                                                "BRANGUS", "CARACU", "CHAROLÊS", "DEVON RED", "GIR", "GIROLANDO", "GUZERÁ",
                                                "HEREFORD", "HOLANDÊS", "JERSEY", "LIMOUSIN", "MARCHIGIANA", "MESTIÇO", "NELORE",
                                                "NELORE PO", "PARDO SUÍÇO", "SANTA GERTRUDIS", "SENEPOL", "SIMENTAL", "SINDI", "SINDINEL",
                                                "TABAPUÃ", "WAGYU", "OUTRO"].map((raca, index) => (
                                                    <Picker.Item key={index} label={raca} value={raca} />
                                                ))}
                                            </Picker>
                                        </View>

                                        <Text>Filtrar por Propriedade:</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={this.state.selectedProperty}
                                                onValueChange={(itemValue) => this.setState({ selectedProperty: itemValue })}
                              
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="Todas" value="" />
                                                {this.props.globalProperties && this.props.globalProperties.map((property, index) => (
                                                    <Picker.Item key={index} label={property.name} value={property.name} />
                                                ))}
                                            </Picker>
                                        </View>

                                        <TouchableOpacity style={styles.applyButton} onPress={this.applyFilter}>
                                            <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.clearButton} onPress={this.clearFilter}>
                                            <Text style={styles.clearButtonText}>Limpar Filtro</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </SafeAreaView>
            </>
        );
    }}

// Wrapper funcional para usar o Context
export default function AnimaisCadastradosWrapper(props) {
  const { properties } = useData();
  return <AnimaisCadastrados {...props} globalProperties={properties} />;
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    summaryContainer: {
        backgroundColor: '#058301',
        padding: 15,
        borderRadius: 10,
        margin: 15,
        alignItems: 'left',
    },
    summaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedItemContainer: {
        backgroundColor: '#d3ffd3', // Cor de fundo para o item selecionado
    },
    item: {
        flex: 1,
    },
    text: {
        fontSize: 18,
        fontWeight: 900,
        color: '#555',
        marginBottom: 4,
      },
        subtext: {
            fontSize: 16,
            color: '#333',
            marginBottom: 4,
          },
            buttonGroup: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 10,
    },
    duplicateButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#007BFF',
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FF5722',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20,
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
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectionHeader: {
        backgroundColor: '#058301',
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedItem: {
        backgroundColor: '#d3ffd3',
    },
    addButton: {
        backgroundColor: '#ffff',
        width: 35,
        height: 35,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10, // Espaço entre os botões
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    propertyGroup: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    propertyTitle: {
        marginHorizontal: 15,
        fontSize: 20,
        fontWeight: 900,
        color: '#555',
        marginBottom: 4,
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
pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
},
confirmButton: {
    marginTop: 10,
    backgroundColor: '#058301',
    padding: 10,
    borderRadius: 5,
},
confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
},
cancelButton: {
    marginTop: 10,
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
},
cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
},
applyButton: {
    backgroundColor: '#058301',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%', // Garantir que ocupe toda a largura
    marginTop: 10,
},
applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
},
filterButton: {
    backgroundColor: '#058301',
    width: 35,
    height: 35,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
},
pickerWrapper: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 5,
},
picker: {
    width: '100%',
    height: 50, // Altura do Picker para evitar corte
},
clearButton: { 
    backgroundColor: 'red',     
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%', // Garantir que ocupe toda a largura
    marginTop: 10,},

clearButtonText: { 
    color: '#fff',
    fontWeight: 'bold', 
},
propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ✅ Move o checkbox para a direita
    paddingHorizontal: 10, // Adiciona espaçamento lateral
},
checkbox: {
    marginRight: 10,
    alignSelf: 'center',
    marginTop: -6,
}
});
