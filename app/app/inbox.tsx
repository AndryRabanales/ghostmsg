// app/inbox.tsx — bandeja de entrada del creador
// Lista de chats en tiempo real (WebSocket), archivar/borrar, compartir link.
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import {
  archiveChat,
  ChatSummary,
  deleteChat,
  getChats,
  openChat,
} from "../src/api";
import { dashboardWsUrl, publicLink } from "../src/config";
import { clearBadge, registerForPush, unregisterPush } from "../src/push";
import { useSession } from "../src/session";
import { colors, radius } from "../src/theme";
import { Avatar, EmptyState, ErrorState, Loading } from "../src/ui";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Inbox() {
  const router = useRouter();
  const { session, signOut } = useSession();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const showArchivedRef = useRef(showArchived);
  showArchivedRef.current = showArchived;

  const load = useCallback(
    async (silent = false) => {
      if (!session) return;
      if (!silent) setError(null);
      try {
        const data = await getChats(session.token, session.dashboardId, showArchivedRef.current);
        setChats(data);
      } catch (e: any) {
        if (!silent) setError(e?.message || "Error cargando tus chats.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session]
  );

  // Recarga al entrar/volver a la pantalla y al cambiar de vista.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
      clearBadge(); // al mirar la bandeja, se limpia el contador del ícono
    }, [load, showArchived])
  );

  // Registra este dispositivo para notificaciones push (una vez por sesión).
  useEffect(() => {
    if (session) registerForPush(session.token);
  }, [session?.token]);

  // WebSocket: mensajes nuevos + estado online de los anónimos.
  useEffect(() => {
    if (!session) return;
    const ws = new WebSocket(dashboardWsUrl(session.dashboardId, session.token));
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data));
        if (data.type === "new_message" || data.type === "message") {
          load(true);
        }
        if (data.type === "ANON_STATUS_UPDATE") {
          setOnline((prev) => ({ ...prev, [data.chatId]: data.status === "online" }));
        }
      } catch {
        // mensajes no-JSON: se ignoran
      }
    };
    return () => ws.close();
  }, [session, load]);

  if (!session) {
    router.replace("/login");
    return null;
  }

  const handleShare = () => {
    Share.share({
      message: `Mándame un mensaje anónimo 👻 ${publicLink(session.publicId)}`,
    }).catch(() => {});
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await unregisterPush(session.token); // este dispositivo deja de recibir push
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleOpen = async (chat: ChatSummary) => {
    openChat(session.token, session.dashboardId, chat.id).catch(() => {});
    router.push(`/chat/${chat.id}`);
  };

  const handleOptions = (chat: ChatSummary) => {
    Alert.alert(chat.anonAlias || "Anónimo", undefined, [
      showArchived
        ? {
            text: "♻️ Restaurar",
            onPress: async () => {
              setChats((p) => p.filter((c) => c.id !== chat.id));
              archiveChat(session.token, session.dashboardId, chat.id, false).catch(() =>
                load(true)
              );
            },
          }
        : {
            text: "🗂 Archivar",
            onPress: async () => {
              setChats((p) => p.filter((c) => c.id !== chat.id));
              archiveChat(session.token, session.dashboardId, chat.id, true).catch(() =>
                load(true)
              );
            },
          },
      {
        text: "🗑 Borrar para siempre",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "¿Borrar este chat?",
            "Se eliminará para siempre y abandonarás la conversación.",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Borrar",
                style: "destructive",
                onPress: () => {
                  setChats((p) => p.filter((c) => c.id !== chat.id));
                  deleteChat(session.token, session.dashboardId, chat.id).catch(() =>
                    load(true)
                  );
                },
              },
            ]
          );
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const renderItem = ({ item }: { item: ChatSummary }) => (
    <Pressable
      style={({ pressed }) => [styles.chatItem, pressed && { opacity: 0.75 }]}
      onPress={() => handleOpen(item)}
      onLongPress={() => handleOptions(item)}
    >
      <Avatar name={item.anonAlias} online={online[item.id] ?? false} />
      <View style={styles.chatMain}>
        <View style={styles.chatTopRow}>
          <Text style={styles.chatAlias} numberOfLines={1}>
            {item.anonAlias || "Anónimo"}
          </Text>
          <Text style={styles.chatDate}>
            {formatDate(item.previewMessage?.createdAt || item.createdAt)}
          </Text>
        </View>
        <View style={styles.chatPreviewRow}>
          {item.anonReplied && <Text style={styles.newBadge}>Nuevo</Text>}
          <Text style={styles.chatPreview} numberOfLines={1}>
            {item.previewMessage?.content || "Chat iniciado, sin mensajes"}
          </Text>
        </View>
      </View>
      <Pressable hitSlop={10} onPress={() => handleOptions(item)}>
        <Text style={styles.dots}>⋯</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Cabecera */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hola, {session.name?.split(" ")[0] || "👻"}</Text>
          <Text style={styles.headerTitle}>
            {showArchived ? "Archivados" : "Bandeja de Entrada"}
            {chats.length > 0 ? `  ·  ${chats.length}` : ""}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconBtn} onPress={() => router.push("/profile")}>
            <Text style={styles.iconTxt}>👤</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={handleLogout}>
            <Text style={styles.iconTxt}>🚪</Text>
          </Pressable>
        </View>
      </View>

      {/* Acciones principales */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤 Compartir mi link</Text>
        </Pressable>
        <Pressable
          style={styles.archToggle}
          onPress={() => setShowArchived((v) => !v)}
        >
          <Text style={styles.archToggleText}>
            {showArchived ? "← Bandeja" : "🗂 Archivados"}
          </Text>
        </Pressable>
      </View>

      {/* Lista / estados */}
      {loading ? (
        <Loading label="Cargando chats…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { setLoading(true); load(); }} />
      ) : chats.length === 0 ? (
        showArchived ? (
          <EmptyState
            emoji="🗂"
            title="No tienes chats archivados"
            subtitle="Los chats que archives aparecerán aquí."
          />
        ) : (
          <EmptyState
            emoji="👻"
            title="Tu espacio secreto está silencioso"
            subtitle="¡Comparte tu link para que la conversación comience!"
          />
        )
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  hello: { color: colors.textDim, fontSize: 13 },
  headerTitle: { color: colors.text, fontSize: 21, fontWeight: "800", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconTxt: { fontSize: 17 },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  archToggle: {
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  archToggleText: { color: colors.accent, fontWeight: "700", fontSize: 13 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 13,
    marginBottom: 10,
  },
  chatMain: { flex: 1, minWidth: 0 },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  chatAlias: { color: colors.text, fontWeight: "700", fontSize: 15, flexShrink: 1 },
  chatDate: { color: colors.textFaint, fontSize: 11 },
  chatPreviewRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  newBadge: {
    color: "#fff",
    backgroundColor: colors.danger,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  chatPreview: { color: colors.textDim, fontSize: 13, flex: 1 },
  dots: { color: colors.textDim, fontSize: 22, paddingHorizontal: 4 },
});
