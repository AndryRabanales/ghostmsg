// src/config.ts — configuración central de la app (mismo backend que la web)
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const API_URL: string = extra.apiUrl || "https://api.ghostmsg.space";
export const WEB_URL: string =
  extra.webUrl || "https://ghost-web-production.up.railway.app";

export const GOOGLE_WEB_CLIENT_ID: string = extra.googleWebClientId || "";
export const GOOGLE_IOS_CLIENT_ID: string = extra.googleIosClientId || "";
export const GOOGLE_ANDROID_CLIENT_ID: string = extra.googleAndroidClientId || "";

/** URL del WebSocket del dashboard (misma que usa la web). */
export function dashboardWsUrl(dashboardId: string, token: string): string {
  return `${API_URL.replace(/^http/, "ws")}/ws?dashboardId=${dashboardId}&token=${token}`;
}

/** Link público del creador (el que comparte en sus historias). */
export function publicLink(publicId: string): string {
  return `${WEB_URL}/u/${publicId}`;
}
