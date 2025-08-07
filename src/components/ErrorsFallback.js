import { View, Text, Button, ImageBackground, StyleSheet } from "react-native";

const CustomErrorFallback = (props) => (
  <ImageBackground
    source={require('../../assets/imagesLogin/background.jpg')}
    style={styles.imageBackground}
    resizeMode="cover"
  >
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Algo deu errado!
      </Text>
      <Text style={{  marginBottom: 10, maxWidth: 250, textAlign: 'center'}}>
        Caso o erro persista entre em contato com o Administrador.
      </Text>
      <Text style={{ color: "red", marginBottom: 20 }}>{props.error.toString()}</Text>
      <Button title="Tentar novamente" onPress={props.resetError}  />
    </View>
      </ImageBackground>
);

export default CustomErrorFallback;


const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
