// app/_layout.tsx — layout raíz: sesión + stack oscuro.
// (Las notificaciones se conectan desde la bandeja, no en el arranque, para
//  no arriesgar el montaje inicial de la app.)
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider } from "../src/session";
import { colors } from "../src/theme";

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
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
