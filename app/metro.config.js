// metro.config.js — config estándar de Expo (habilita require.context para
// expo-router, entre otras cosas). Faltaba en el proyecto.
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
