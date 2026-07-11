// app/chats/[anonToken]/[chatId].tsx — universal link a un chat anónimo.
// El chat del anónimo vive en la web: se abre en el navegador y volvemos.
import React, { useEffect } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { WEB_URL } from "../../../src/config";
import { Loading } from "../../../src/ui";
import { colors } from "../../../src/theme";

export default function AnonChatLink() {
  const { anonToken, chatId } = useLocalSearchParams<{
    anonToken: string;
    chatId: string;
  }>();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (anonToken && chatId) {
        await WebBrowser.openBrowserAsync(`${WEB_URL}/chats/${anonToken}/${chatId}`);
      }
      router.replace("/");
    })();
  }, [anonToken, chatId]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Loading label="Abriendo chat…" />
    </View>
  );
}
