// src/push.ts — notificaciones push (Expo Notifications)
// Pide permiso, obtiene el token del dispositivo y lo registra en el backend.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { API_URL } from "./config";

// Comportamiento en primer plano: muestra banner + suena (2.6).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/** Canal Android (requerido para que suenen y aparezcan). */
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Mensajes",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#8e2de2",
  });
}

/**
 * Pide permiso, obtiene el Expo push token y lo registra en el backend.
 * Falla en silencio (la app funciona igual sin push).
 * Devuelve el token registrado o null.
 */
export async function registerForPush(authToken: string): Promise<string | null> {
  try {
    await ensureAndroidChannel();

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return null;

    const projectId =
      (Constants.expoConfig as any)?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;
    if (!projectId) {
      // Sin proyecto EAS todavía (falta `eas init`): no hay token posible.
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenData.data;

    await fetch(`${API_URL}/creators/me/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: pushToken, platform: Platform.OS }),
    });

    return pushToken;
  } catch {
    return null;
  }
}

/** Da de baja el token al cerrar sesión. */
export async function unregisterPush(authToken: string): Promise<void> {
  try {
    const projectId =
      (Constants.expoConfig as any)?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;
    if (!projectId) return;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    await fetch(`${API_URL}/creators/me/push-token`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: tokenData.data }),
    });
  } catch {
    // sin red o sin permiso: no bloquea el logout
  }
}

/** Limpia el contador (badge) del ícono de la app. */
export function clearBadge() {
  Notifications.setBadgeCountAsync(0).catch(() => {});
}
