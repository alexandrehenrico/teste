export function alertFirebaseErrors (Alert, defaultMessage = "Erro em alguma operação com firebase.", error) {
  let message = defaultMessage;
  if (error.message === "Missing or insufficient permissions.") {
    message += " Você está tentando acessar recursos que não tem permissão.";
  }
  Alert.alert("Erro", message);
  console.error(error);
}