// app/u/[publicId].tsx — universal link a un perfil público.
// Enviar mensajes anónimos es un flujo web: se abre en el navegador y volvemos.
import React, { useEffect } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { WEB_URL } from "../../src/config";
import { Loading } from "../../src/ui";
import { colors } from "../../src/theme";

export default function PublicProfileLink() {
  const { publicId } = useLocalSearchParams<{ publicId: string }>();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (publicId) {
        await WebBrowser.openBrowserAsync(`${WEB_URL}/u/${publicId}`);
      }
      router.replace("/");
    })();
  }, [publicId]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Loading label="Abriendo perfil…" />
    </View>
  );
}
