// app/login.tsx — inicio de sesión con Google (expo-auth-session)
// El id_token de Google se manda al backend /auth/google (mismo flujo que la web).
import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { loginWithGoogle } from "../src/api";
import { useSession } from "../src/session";
import { colors, radius } from "../src/theme";
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from "../src/config";

// Cierra el popup del navegador al volver a la app.
WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const { signIn } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
  });

  useEffect(() => {
    if (response?.type !== "success") {
      if (response?.type === "error") setError("No se pudo iniciar con Google.");
      return;
    }
    const idToken = (response.params as any)?.id_token;
    if (!idToken) {
      setError("Google no devolvió el token.");
      return;
    }
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const data = await loginWithGoogle(idToken);
        await signIn({
          token: data.token,
          dashboardId: data.dashboardId,
          publicId: data.publicId,
          name: data.name,
        });
        router.replace("/inbox");
      } catch (e: any) {
        setError(e?.message || "Error iniciando sesión.");
      } finally {
        setBusy(false);
      }
    })();
  }, [response]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.ghost}>👻</Text>
      <Text style={styles.title}>GhostMsg</Text>
      <Text style={styles.subtitle}>
        Recibe mensajes anónimos y responde en un chat privado.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.googleBtn,
          (!request || busy) && { opacity: 0.6 },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
        disabled={!request || busy}
        onPress={() => {
          setError(null);
          promptAsync();
        }}
      >
        <Text style={styles.googleG}>G</Text>
        <Text style={styles.googleText}>
          {busy ? "Entrando…" : "Continuar con Google"}
        </Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.legal}>
        Al continuar aceptas nuestros términos y política de privacidad.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  ghost: { fontSize: 64, marginBottom: 8 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 36,
    lineHeight: 22,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    width: "100%",
    maxWidth: 320,
  },
  googleG: { color: "#4285F4", fontWeight: "800", fontSize: 18 },
  googleText: { color: "#1f1f1f", fontWeight: "700", fontSize: 15 },
  error: { color: colors.dangerSoft, marginTop: 16, textAlign: "center" },
  legal: {
    color: colors.textFaint,
    fontSize: 11.5,
    textAlign: "center",
    position: "absolute",
    bottom: 32,
    left: 28,
    right: 28,
  },
});
