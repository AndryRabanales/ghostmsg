// app/_layout.tsx — layout raíz: sesión, stack oscuro y deep link de notificaciones
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { SessionProvider } from "../src/session";
import { colors } from "../src/theme";
import "../src/push"; // registra el handler de notificaciones en primer plano

/** Tocar una notificación → navega al chat correcto (2.5). */
function NotificationRouter() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    // App abierta desde cero tocando la notificación (cold start).
    const url = lastResponse?.notification?.request?.content?.data?.url;
    if (typeof url === "string" && url.startsWith("/")) {
      router.push(url as any);
    }
  }, [lastResponse]);

  useEffect(() => {
    // App ya abierta (foreground/background) y el usuario toca la notificación.
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === "string" && url.startsWith("/")) {
        router.push(url as any);
      }
    });
    return () => sub.remove();
  }, [router]);

  return null;
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <NotificationRouter />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="inbox" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[chatId]" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{ presentation: "modal", title: "Editar perfil" }}
        />
        <Stack.Screen name="u/[publicId]" options={{ headerShown: false }} />
        <Stack.Screen
          name="chats/[anonToken]/[chatId]"
          options={{ headerShown: false }}
        />
      </Stack>
    </SessionProvider>
  );
}
