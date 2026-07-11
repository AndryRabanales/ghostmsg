// app/profile.tsx — editar perfil: nombre, prompts y foto (con recorte nativo)
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { getMe, updateMe } from "../src/api";
import { useSession } from "../src/session";
import { colors, radius } from "../src/theme";
import { Avatar, Loading, PrimaryButton } from "../src/ui";

const DEFAULT_ALIAS = "Ej. Fan secreto, Vecino curioso...";
const DEFAULT_MESSAGE = "Dime qué piensas de mí...";

export default function Profile() {
  const router = useRouter();
  const { session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [aliasPrompt, setAliasPrompt] = useState("");
  const [messagePrompt, setMessagePrompt] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const me = await getMe(session.token);
        setName(me.name || "");
        setAliasPrompt(me.aliasPrompt || "");
        setMessagePrompt(me.messagePrompt || "");
        setAvatarUrl(me.avatarUrl || null);
      } catch {
        // si falla, el formulario queda editable con lo local
        setName(session.name || "");
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  if (!session) {
    router.replace("/login");
    return null;
  }

  // Elegir foto: el picker nativo ya permite mover/ajustar el recorte cuadrado
  // (el mismo encuadre que verán los anónimos). Luego se comprime a 256px.
  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso necesario", "Permite el acceso a tus fotos para elegir una.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true, // recorte nativo: mover + zoom en cuadrado
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const manipulated = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 256, height: 256 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (manipulated.base64) {
      setAvatarUrl(`data:image/jpeg;base64,${manipulated.base64}`);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Falta tu nombre", "El nombre no puede estar vacío.");
      return;
    }
    setSaving(true);
    try {
      await updateMe(session.token, {
        name: name.trim(),
        aliasPrompt: aliasPrompt.trim(),
        messagePrompt: messagePrompt.trim(),
        avatarUrl,
      });
      await update({ name: name.trim() });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Cargando tu perfil…" />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      {/* Foto */}
      <View style={styles.photoRow}>
        <Avatar name={name} avatarUrl={avatarUrl} size={84} />
        <View style={{ gap: 8 }}>
          <Pressable style={styles.photoBtn} onPress={pickPhoto}>
            <Text style={styles.photoBtnText}>
              {avatarUrl ? "Cambiar foto" : "Subir foto"}
            </Text>
          </Pressable>
          {avatarUrl && (
            <Pressable onPress={() => setAvatarUrl(null)}>
              <Text style={styles.removeText}>Quitar</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Campos */}
      <Text style={styles.label}>Tu nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        maxLength={40}
        placeholder="Tu nombre"
        placeholderTextColor={colors.textFaint}
      />
      <Text style={styles.hint}>Aparece como “Enviar a {name || "…"}” en tu página.</Text>

      <Text style={styles.label}>Texto del alias</Text>
      <TextInput
        style={styles.input}
        value={aliasPrompt}
        onChangeText={setAliasPrompt}
        maxLength={80}
        placeholder={DEFAULT_ALIAS}
        placeholderTextColor={colors.textFaint}
      />
      <Text style={styles.hint}>Sugerencia dentro del campo “Tu alias”.</Text>

      <Text style={styles.label}>Texto del mensaje</Text>
      <TextInput
        style={styles.input}
        value={messagePrompt}
        onChangeText={setMessagePrompt}
        maxLength={120}
        placeholder={DEFAULT_MESSAGE}
        placeholderTextColor={colors.textFaint}
      />
      <Text style={styles.hint}>La pregunta que verán, ej. “¿Qué piensas de mí?”.</Text>

      <PrimaryButton
        label={saving ? "Guardando…" : "Guardar cambios"}
        onPress={handleSave}
        disabled={saving}
        style={{ marginTop: 22 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 22, paddingBottom: 48 },
  photoRow: { flexDirection: "row", alignItems: "center", gap: 18, marginBottom: 20 },
  photoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: "rgba(201,164,255,0.14)",
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  photoBtnText: { color: colors.accent, fontWeight: "700", fontSize: 13.5 },
  removeText: { color: colors.textFaint, fontSize: 12.5, textAlign: "center" },
  label: {
    color: colors.accent,
    fontSize: 12.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 16,
    marginBottom: 7,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  hint: { color: colors.textFaint, fontSize: 11.5, marginTop: 5 },
});
