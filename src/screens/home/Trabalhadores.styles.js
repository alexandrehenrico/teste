import { StyleSheet } from 'react-native';

const theme = {
    colors: {
      primary: '#058301',
      secondary: '#fff',
      text: '#333',
      placeholder: '#aaa',
    },
    fontSizes: {
      small: 12,
      medium: 15,
      large: 18,
    },
  };
  
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
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
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', },
    addButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fff',
    },
    scrollView: { flex: 1 },
    card: {
      backgroundColor: '#fff',
      marginVertical: 8,
      marginHorizontal: 15,
      borderRadius: 10,
      padding: 15,
      elevation: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    foto: {
      width: 70,
      height: 70,
      borderRadius: 35,
    },
    cardTextContainer: {
      flex: 1,
      marginLeft: 10,
    },
    cardText: {
      fontSize: 16,
      color: '#333',
      marginBottom: 4,
    },
      cardNome: {
      fontSize: 18,
      fontWeight: 900,
      color: '#555',
      marginBottom: 4,
    },
      buttonsContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButton: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
      backgroundColor: '#058301',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 5,
    },
    deleteButton: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
      backgroundColor: '#FF0000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    label: { marginBottom: 8, marginTop: 8, color: '#404040', fontSize: 15, fontWeight: 'bold' },
    input: {
      height: 42,
      width: '100%',
      backgroundColor: '#FFF',
      borderBottomWidth: 1.5,
      borderColor: '#556b2f',
      borderRadius: 6,
      paddingHorizontal: 10,
      fontSize: 15,
      marginVertical: 5,
    },
    modalContent: {
      backgroundColor: '#f5f5f5',
      padding: 20,
      borderRadius: 10,
      width: '90%',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
    saveButton: {
      flex: 1,
      backgroundColor: '#058301',
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginRight: 10,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: 'red',
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButtonText: { color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: '600' },
    cancelButtonText: { color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: '600' },
    button: {
      backgroundColor: '#058301',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginVertical: 5,
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    fotoPreview: { width: 100, height: 100, borderRadius: 10, marginVertical: 10 
    }
  });
  
  export default styles;