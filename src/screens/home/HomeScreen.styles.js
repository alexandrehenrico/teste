import { StyleSheet } from 'react-native';

const primaryColor = '#058301';
const secondaryColor = '#fff';
const textColor = '#333';
const borderColor = '#ccc';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  headercontainer: {
    backgroundColor: '#F9F9F9',
    margin: 15,
  },
  scrollContent: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: primaryColor,
    padding: 15,
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  greeting: {
    color: secondaryColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
  meusDadosButton: {
    backgroundColor: secondaryColor,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  meusDadosText: {
    fontSize: 12,
    color: primaryColor,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: secondaryColor,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: borderColor,
    marginRight: 10,
    color: textColor,
  },
  button: {
    backgroundColor: primaryColor,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: secondaryColor,
    fontWeight: 'bold',
    fontSize: 15,
  },
  spinner: {
    marginVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primaryColor,
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  weatherText: {
    fontSize: 25,
    color: secondaryColor,
    fontWeight: '900',
  },
  weatherDescription: {
    fontSize: 12,
    color: secondaryColor,
    marginTop: 1,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  weatherLocation: {
    fontSize: 18,
    color: secondaryColor,
    marginTop: 1,
    fontWeight: '900',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionButtonSmall: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: primaryColor,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 4,
    maxWidth: '100%',
  },
  sectionText: {
    color: secondaryColor,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  cotacoesContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: primaryColor,
    borderRadius: 8,
  },
  cotacaoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: secondaryColor,
    marginBottom: 10,
    textAlign: 'center',
  },
  cotacaoCard: {
    padding: 7,
    borderBottomWidth: 1.3,
    borderBottomColor: secondaryColor,
  },
  cotacaoLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: secondaryColor,
  },
  fonteLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: secondaryColor,
    textAlign: 'right',
    marginTop: 10,
  },
  cotacaoValue: {
    fontSize: 15,
    fontWeight: '900',
    color: secondaryColor,
  },
  site: {
    width: '100%',
    marginVertical: 20,
    alignItems: 'center',
    borderRadius: 10,
  },
  imagesite: {
    width: '100%',
    height: 100,
  },
});

export default styles;
