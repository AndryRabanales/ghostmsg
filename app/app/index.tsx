// app/index.tsx — punto de entrada: manda a la bandeja si hay sesión, si no al login
import React from "react";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { useSession } from "../src/session";
import { Loading } from "../src/ui";
import { colors } from "../src/theme";

export default function Index() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Loading label="Abriendo tu espacio secreto…" />
      </View>
    );
  }

  return session ? <Redirect href="/inbox" /> : <Redirect href="/login" />;
}
