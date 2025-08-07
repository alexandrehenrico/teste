module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: true, // Ativar modo seguro para garantir que as variáveis existam
        allowUndefined: true, // Permite variáveis indefinidas
      }],
    ],
  };
};

