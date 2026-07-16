// babel.config.js — requerido por Expo.
// babel-preset-expo aplica las transformaciones de expo-router y añade el
// plugin de react-native-reanimated (debe ir al final). Sin este archivo la
// app crasheaba al abrir a nivel nativo.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
