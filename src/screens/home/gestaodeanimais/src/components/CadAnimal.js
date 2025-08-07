import auth from '@react-native-firebase/auth'; // adicione no topo
import React, { Component } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Modal,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { TextInputMask } from 'react-native-masked-text';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';

const racas = [
    { label: 'ABERDEEN', value: 'ABERDEEN' },
    { label: 'ANGUS BLACK', value: 'ANGUS BLACK' },
    { label: 'ANGUS RED', value: 'ANGUS RED' },
    { label: 'BONSMARA', value: 'BONSMARA' },
    { label: 'BRAFORD', value: 'BRAFORD' },
    { label: 'BRAHMAN', value: 'BRAHMAN' },
    { label: 'BRANGUS', value: 'BRANGUS' },
    { label: 'CARACU', value: 'CARACU' },
    { label: 'CHAROLÊS', value: 'CHAROLÊS' },
    { label: 'DEVON RED', value: 'DEVON RED' },
    { label: 'GIR', value: 'GIR' },
    { label: 'GIROLANDO', value: 'GIROLANDO' },
    { label: 'GUZERÁ', value: 'GUZERÁ' },
    { label: 'HEREFORD', value: 'HEREFORD' },
    { label: 'HOLANDÊS', value: 'HOLANDÊS' },
    { label: 'JERSEY', value: 'JERSEY' },
    { label: 'LIMOUSIN', value: 'LIMOUSIN' },
    { label: 'MARCHIGIANA', value: 'MARCHIGIANA' },
    { label: 'MESTIÇO', value: 'MESTIÇO' },
    { label: 'NELORE', value: 'NELORE' },
    { label: 'NELORE PO', value: 'NELORE PO' },
    { label: 'PARDO SUÍÇO', value: 'PARDO SUÍÇO' },
    { label: 'SANTA GERTRUDIS', value: 'SANTA GERTRUDIS' },
    { label: 'SENEPOL', value: 'SENEPOL' },
    { label: 'SIMENTAL', value: 'SIMENTAL' },
    { label: 'SINDI', value: 'SINDI' },
    { label: 'SINDINEL', value: 'SINDINEL' },
    { label: 'TABAPUÃ', value: 'TABAPUÃ' },
    { label: 'WAGYU', value: 'WAGYU' },
    { label: 'OUTRO', value: 'OUTRO' },
];

const initialState = {
    indAnimal: '',
    origem: '',
    raca: '',
    desc: '',
    peso: '',
    data: new Date(),
    sexo: '',
    selectedProperty: '',
    properties: [],
    isOrigemModalVisible: false,
    isSexoModalVisible: false,
    showDatePicker: false, 
} 

export default class CadAnimal extends Component {
    
    state = {...initialState}


   componentDidMount() {
  this.loadProperties();

  const { animal } = this.props;
  if (animal) {
    this.setState({
      indAnimal: animal.indAnimal,
      origem: animal.origem,
      raca: animal.raca,
      desc: animal.desc,
      peso: animal.peso,
      data: animal.data ? new Date(animal.data) : new Date(),
      sexo: animal.sexo,
      selectedProperty: animal.property || '',
    });
  }
}


loadProperties = async () => {
  try {
    const snapshot = await firestore().collection('propriedades').get();
    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    this.setState({ properties: fetched });
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
  }
};



save = async () => {
    const { animal } = this.props;
    const currentUser = auth().currentUser;

    const updatedAnimal = {
        indAnimal: this.state.indAnimal,
        origem: this.state.origem,
        raca: this.state.raca,
        desc: this.state.desc,
        peso: this.state.peso,
        data: this.state.data,
        sexo: this.state.sexo,
        property: this.state.selectedProperty,
        userId: currentUser ? currentUser.uid : null, // 🔐 associando ao usuário logado
    };

    try {
        if (animal && animal.id) {
            await firestore().collection('animais').doc(animal.id).set(updatedAnimal);
        } else {
            await firestore().collection('animais').add(updatedAnimal);
        }

        this.setState({ ...initialState });
        this.props.onCancel();
    } catch (error) {
        console.error('Erro ao salvar animal:', error);
        Alert.alert('Erro', 'Não foi possível salvar o animal.');
    }
};

    
    
    handleInputChange = (field, value) => {
        this.setState({ [field]: value });
    };
    
    toggleOrigemModal = () => {
        this.setState({ isOrigemModalVisible: !this.state.isOrigemModalVisible });
    };

    toggleSexoModal = () => {
        this.setState({ isSexoModalVisible: !this.state.isSexoModalVisible });
    };
    

    handleDateChange = (event, selectedDate) => {
        if (event.type === 'set') { // Usuário escolheu uma data
            this.setState({ data: selectedDate, showDatePicker: false });
        } else { // Usuário cancelou
            this.setState({ showDatePicker: false });
        }
    };

    showDatePickerHandler = () => {
        this.setState({ showDatePicker: true });
    };


    render() {
        return (
            <Modal
                transparent={true}
                visible={this.props.isVisible}
                onRequestClose={this.props.onCancel}
                animationType="slide"
            >
                <SafeAreaView style={styles.container}>
                    <View style={styles.titulo}>
                        <Text style={styles.textoTitulo}>Registro Animal</Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>

                    <View style={styles.bordas}>
                            <Text style={styles.textos}>Propriedade</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={this.state.selectedProperty}
                                    onValueChange={(itemValue) =>
                                        this.setState({ selectedProperty: itemValue })
                                    }
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Selecione uma propriedade" value="" />
                                    {this.state.properties.map((property, idx) => (
                                        <Picker.Item key={idx} label={property.name} value={property.name} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.bordas}>
                            <Text style={styles.textos}>Identificação Animal</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Informe a Identificação"
                                value={this.state.indAnimal}
                                onChangeText={value => this.handleInputChange('indAnimal', value)}
                            />
                        </View>

                        <View style={styles.bordas}>
                            <Text style={styles.textos}>Origem</Text>
                            <TouchableOpacity
                                style={styles.seletor}
                                onPress={this.toggleOrigemModal}
                            >
                                <Text style={styles.seletorTexto}>
                                    {this.state.origem || 'Selecione a Origem'}
                                </Text>
                            </TouchableOpacity>
                            <Modal
                                transparent={true}
                                visible={this.state.isOrigemModalVisible}
                                animationType="fade"
                                onRequestClose={this.toggleOrigemModal}
                            >
                            <TouchableWithoutFeedback onPress={this.toggleOrigemModal}>
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContainer}>
                                        <TouchableOpacity
                                            style={styles.modalItem}
                                            onPress={() => {
                                                this.handleInputChange('origem', 'Compra');
                                                this.toggleOrigemModal();
                                            }}
                                        >
                                            <Text style={styles.modalTexto}>Compra</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.modalItem}
                                            onPress={() => {
                                                this.handleInputChange('origem', 'Nascimento');
                                                this.toggleOrigemModal();
                                            }}
                                        >
                                            <Text style={styles.modalTexto}>Nascimento</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                            </Modal>
                        </View>
                        <View style={styles.bordas}>
                            <Text style={styles.textos}>Raça</Text>
                            <Dropdown
                                data={racas}
                                labelField="label"
                                valueField="value"
                                value={this.state.raca}
                                onChange={item => this.handleInputChange('raca', item.value)}
                                placeholder="Selecione a Raça"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.bordas}>
                            <Text style={styles.textos}>Descrição</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Informe a Descrição"
                                value={this.state.desc}
                                onChangeText={value => this.handleInputChange('desc', value)}
                            />
                        </View>

                        <View style={styles.bordas}>
                            <Text style={styles.textos}>Peso (KG)</Text>
                            <TextInputMask
                                type="custom"
                                options={{
                                    mask: '9999.9',
                                }}
                                style={styles.input}
                                placeholder="Informe o Peso (Ex: 100.5)"
                                value={this.state.peso}
                                onChangeText={value => this.handleInputChange('peso', value)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.bordas}>
                            <Text style={styles.textos}>Data de Nascimento</Text>
                            <TouchableOpacity onPress={this.showDatePickerHandler}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Informe a Data"
                                    placeholderTextColor="#B3B3B3"
                                    editable={false}
                                    value={this.state.data.toLocaleDateString('pt-BR')}
                                />
                            </TouchableOpacity>
                            {this.state.showDatePicker && (
                                <DateTimePicker
                                    value={this.state.data}
                                    mode="date"
                                    display="default"
                                    onChange={this.handleDateChange}
                                />
                            )}
                        </View>

                        <View style={styles.bordas}>
                            <Text style={styles.textos}>Sexo</Text>
                            <TouchableOpacity
                                style={styles.seletor}
                                onPress={this.toggleSexoModal}
                            >
                                <Text style={styles.seletorTexto}>
                                    {this.state.sexo || 'Selecione o Sexo'}
                                </Text>
                            </TouchableOpacity>

                            {/* Modal para escolher o sexo */}
                            <Modal
                                transparent={true}
                                visible={this.state.isSexoModalVisible}
                                animationType="fade"
                                onRequestClose={this.toggleSexoModal}
                            >
                            <TouchableWithoutFeedback onPress={this.toggleSexoModal}>
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContainer}>
                                        <TouchableOpacity
                                            style={styles.modalItem}
                                            onPress={() => {
                                                this.handleInputChange('sexo', 'Macho');
                                                this.toggleSexoModal();
                                            }}
                                        >
                                            <Text style={styles.modalTexto}>Macho</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.modalItem}
                                            onPress={() => {
                                                this.handleInputChange('sexo', 'Fêmea');
                                                this.toggleSexoModal();
                                            }}
                                            >
                                            <Text style={styles.modalTexto}>Fêmea</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </View>
                    </ScrollView>

                    <View style={styles.botoes}>
                    <TouchableOpacity style={styles.botao} onPress={this.save}>
                        <Text style={styles.botaoTexto}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botao} onPress={this.props.onCancel}>
                        <Text style={styles.botaoTexto}>Cancelar</Text>
                    </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#F9F9F9',
        paddingTop: 26,
    },
    scrollContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    titulo: {
        backgroundColor: '#006400',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    textoTitulo: {
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        fontSize: 23,
        letterSpacing: 1,
    },
    bordas: {
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    textos: {
        marginBottom: 8,
        color: '#404040',
        fontSize: 15,
        fontWeight: 'bold',
    },
    input: {
        height: 42,
        width: '100%',
        backgroundColor: '#FFF',
        borderBottomWidth: 1.5,
        borderColor: '#556b2f',
        borderRadius: 6,
        paddingHorizontal: 10,
        fontSize: 15,
    },
    seletor: {
        height: 42,
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderBottomWidth: 1.5,
        borderColor: '#556b2f',
        borderRadius: 6,
        paddingHorizontal: 10,
    },
    seletorTexto: {
        fontSize: 15,
        color: '#404040',
    },
    botoes: {
        marginTop: 30,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    botao: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#238E23',
    },
    botaoTexto: {
        textAlign: 'center',
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    modalTexto: {
        fontSize: 16,
        textAlign: 'center',
    },
    pickerContainer: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#556b2f',
        borderRadius: 6,
        marginVertical: 5,
      },
});
