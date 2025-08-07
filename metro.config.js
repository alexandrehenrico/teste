const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Certifique-se de que o @env seja resolvido corretamente, mesmo estando em uma subpasta
config.resolver.extraNodeModules = {
  '@env': path.resolve(__dirname, '.env'),
};

module.exports = config;
