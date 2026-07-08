// src/utils/inAppBrowser.js

export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Instagram|FBAN|FBAV|FB_IAB|Line\//i.test(ua);
}

/**
 * Intenta sacar al usuario del navegador embebido (Instagram/Facebook)
 * hacia el navegador real del sistema, usando esquemas de URL que
 * solo funcionan de forma confiable si se disparan dentro de un gesto
 * real del usuario (ej. onClick de un botón "Enviar").
 * Devuelve true si se disparó el intento, false si no aplica.
 */
export function tryEscapeToRealBrowser(targetUrl) {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  if (!isInAppBrowser()) return false;

  const ua = navigator.userAgent || "";
  const bare = targetUrl.replace(/^https?:\/\//, "");

  if (/iPhone|iPad|iPod/i.test(ua)) {
    window.location.href = `x-safari-https://${bare}`;
    return true;
  }

  if (/Android/i.test(ua)) {
    window.location.href = `intent://${bare}#Intent;scheme=https;package=com.android.chrome;end`;
    return true;
  }

  return false;
}
