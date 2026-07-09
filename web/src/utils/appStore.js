// src/utils/appStore.js
// Cuando publiques la app, pon aquí las URLs reales de las tiendas.
// Mientras estén vacías, el botón lleva a /descargar (que muestra "Muy pronto").
export const APP_STORE_URL = "";   // iOS  (https://apps.apple.com/app/...)
export const PLAY_STORE_URL = "";  // Android (https://play.google.com/store/apps/details?id=...)

export function getPlatform() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function getStoreUrl() {
  const p = getPlatform();
  if (p === "ios") return APP_STORE_URL;
  if (p === "android") return PLAY_STORE_URL;
  return "";
}

/**
 * Abre la tienda correcta según el dispositivo.
 * Devuelve true si redirigió; false si no hay URL para esa plataforma
 * (para que el llamador haga fallback a /descargar).
 */
export function openStore() {
  const url = getStoreUrl();
  if (url) {
    window.location.href = url;
    return true;
  }
  return false;
}
