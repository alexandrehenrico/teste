import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
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
  
    headerText: {fontSize: 20, fontWeight: 'bold', color: '#fff', },
  
    refreshButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fff',
    },
    searchInput: {
      backgroundColor: '#eee',
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 15,
      marginVertical: 10,
      fontSize: 16,
    },
    newsItem: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#058301',
      padding: 12,
      marginBottom: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 15,
    },
    newsImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
    newsTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: 'bold',
      color: '#555',
      marginBottom: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 75, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      maxHeight: '90%',
    },
    modalImage: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginBottom: 10,
    },
    modalScrollView: {
      width: '100%',
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#004B00',
      textAlign: 'center',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16,
      lineHeight: 24,
      color: '#004B00',
      textAlign: 'justify',
      marginBottom: 10,
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
    },
    readMoreButton: {
      backgroundColor: '#058301',
      padding: 12,
      borderRadius: 8,
      marginRight: 10,
    },
    closeButton: {
      backgroundColor: 'red',
      padding: 12,
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    errorText: {
      color: 'red',
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 15,
    },
  });
  
  export default styles;