import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
    },  
    label: { fontSize: 18, marginTop: 10, marginHorizontal: 20, fontWeight: 'bold'},
    input: { borderWidth: 1, padding: 10, borderRadius: 10, marginVertical: 5, backgroundColor: '#fff', marginHorizontal: 15, fontSize: 14, fontWeight: '600' },
  header: {
      backgroundColor: '#058301',
      paddingVertical: 15,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,  },
    headerText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, },
    subtitle: { fontSize: 20, textAlign: 'center', marginHorizontal: 15, },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    modalInput: { borderBottomWidth: 1, marginBottom: 10, fontSize: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, marginHorizontal: 15, },
    addButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    removeButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' },
  });
 export default styles;  