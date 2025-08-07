import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  titleContainer: {
    backgroundColor: '#058301',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    margintop: 8,
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
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#058301',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#c41616',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;