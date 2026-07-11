// app/chat/[chatId].tsx — chat del creador con un anónimo
// Mensajes + envío + tiempo real (WebSocket) + cronómetro de 24h (HH:MM:SS).
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  blockChat,
  ChatDetail,
  ChatMessage,
  getChat,
  reportChat,
  sendMessage,
} from "../../src/api";
import { dashboardWsUrl } from "../../src/config";
import { useSession } from "../../src/session";
import { colors, radius } from "../../src/theme";
import { Avatar, ErrorState, Loading } from "../../src/ui";

/** Cronómetro HH:MM:SS hasta expiresAt (rojo bajo 1 hora). */
function Countdown({ expiresAt }: { expiresAt: string | null }) {
  const [label, setLabel] = useState<string | null>(null);
  const [critical, setCritical] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("00:00:00");
        setCritical(true);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      setLabel(`${pad(h)}:${pad(m)}:${pad(s)}`);
      setCritical(diff < 3600000);
    };
    tick(); // pinta de inmediato, sin esperar el primer intervalo
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!label) return null;
  return (
    <View style={[styles.timerPill, critical && styles.timerCritical]}>
      <Text style={[styles.timerText, critical && { color: colors.dangerSoft }]}>
        ⏳ {label}
      </Text>
    </View>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const router = useRouter();
  const { session } = useSession();
  const [chat, setChat] = useState<ChatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const load = useCallback(async () => {
    if (!session || !chatId) return;
    try {
      const data = await getChat(session.token, session.dashboardId, chatId);
      setChat(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Error cargando el chat.");
    } finally {
      setLoading(false);
    }
  }, [session, chatId]);

  useEffect(() => {
    load();
  }, [load]);

  // Tiempo real: nuevos mensajes de este chat llegan por el WS del dashboard.
  useEffect(() => {
    if (!session) return;
    const ws = new WebSocket(dashboardWsUrl(session.dashboardId, session.token));
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data));
        if ((data.type === "message" || data.type === "new_message") && data.chatId === chatId) {
          setChat((prev) => {
            if (!prev) return prev;
            if (prev.messages.some((m) => m.id === data.id)) return prev;
            return { ...prev, messages: [...prev.messages, data] };
          });
        }
      } catch {
        // ignora frames no-JSON
      }
    };
    return () => ws.close();
  }, [session, chatId]);

  // Auto-scroll al final cuando llegan mensajes.
  useEffect(() => {
    if (chat?.messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [chat?.messages.length]);

  if (!session) {
    router.replace("/login");
    return null;
  }

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending || !chatId) return;
    setSending(true);
    setDraft("");
    // Mensaje optimista: aparece al instante.
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      from: "creator",
      content,
      createdAt: new Date().toISOString(),
    };
    setChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev
    );
    try {
      const real = await sendMessage(session.token, session.dashboardId, chatId, content);
      setChat((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) => (m.id === optimistic.id ? real : m)),
            }
          : prev
      );
    } catch (e: any) {
      // Revierte el optimista y devuelve el texto al input.
      setChat((prev) =>
        prev
          ? { ...prev, messages: prev.messages.filter((m) => m.id !== optimistic.id) }
          : prev
      );
      setDraft(content);
      setError(e?.message || "No se pudo enviar el mensaje.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setSending(false);
    }
  };

  // Reportar un mensaje concreto (dejar presionada una burbuja del anónimo).
  const handleReportMessage = (message: ChatMessage) => {
    if (!chatId) return;
    Alert.alert("Reportar mensaje", "¿Este mensaje es ofensivo o abusivo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "🚩 Reportar",
        style: "destructive",
        onPress: async () => {
          try {
            await reportChat(session.token, session.dashboardId, chatId, {
              messageId: message.id,
              reason: "Reportado desde la app",
            });
            Alert.alert("Gracias", "Tu reporte fue enviado. Lo revisaremos.");
          } catch {
            Alert.alert("Error", "No se pudo enviar el reporte.");
          }
        },
      },
    ]);
  };

  // Menú de moderación del chat: reportar conversación / bloquear anónimo.
  const handleModeration = () => {
    if (!chatId) return;
    Alert.alert(chat?.anonAlias || "Anónimo", undefined, [
      {
        text: "🚩 Reportar conversación",
        onPress: async () => {
          try {
            await reportChat(session.token, session.dashboardId, chatId, {
              reason: "Conversación reportada desde la app",
            });
            Alert.alert("Gracias", "Tu reporte fue enviado. Lo revisaremos.");
          } catch {
            Alert.alert("Error", "No se pudo enviar el reporte.");
          }
        },
      },
      {
        text: "🚫 Bloquear anónimo",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "¿Bloquear a este anónimo?",
            "Ya no podrá enviarte más mensajes en este chat.",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Bloquear",
                style: "destructive",
                onPress: async () => {
                  try {
                    await blockChat(session.token, session.dashboardId, chatId, true);
                    Alert.alert("Listo", "Este anónimo ya no puede escribirte aquí.");
                  } catch {
                    Alert.alert("Error", "No se pudo bloquear.");
                  }
                },
              },
            ]
          );
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.from === "creator";
    return (
      <View style={[styles.bubbleRow, mine && { justifyContent: "flex-end" }]}>
        <Pressable
          style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleAnon]}
          onLongPress={mine ? undefined : () => handleReportMessage(item)}
          delayLongPress={350}
        >
          <Text style={styles.bubbleText}>{item.content}</Text>
          <Text style={styles.bubbleTime}>{formatTime(item.createdAt)}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Cabecera */}
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Avatar name={chat?.anonAlias} size={38} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.headerName} numberOfLines={1}>
              {chat?.anonAlias || "Anónimo"}
            </Text>
            <Text style={styles.headerSub}>Chat anónimo</Text>
          </View>
          <Countdown expiresAt={chat?.expiresAt ?? null} />
          <Pressable hitSlop={10} onPress={handleModeration}>
            <Text style={styles.headerDots}>⋯</Text>
          </Pressable>
        </View>

        {/* Mensajes / estados */}
        {loading ? (
          <Loading label="Abriendo chat…" />
        ) : error && !chat ? (
          <ErrorState message={error} onRetry={() => { setLoading(true); load(); }} />
        ) : (
          <FlatList
            ref={listRef}
            data={chat?.messages ?? []}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {error && chat && <Text style={styles.sendError}>{error}</Text>}

        {/* Input */}
        <View style={styles.footer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Escribe tu respuesta…"
            placeholderTextColor={colors.textFaint}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendBtn, (!draft.trim() || sending) && { opacity: 0.45 }]}
            onPress={handleSend}
            disabled={!draft.trim() || sending}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { color: colors.text, fontSize: 24, paddingRight: 2 },
  headerName: { color: colors.text, fontWeight: "700", fontSize: 16 },
  headerSub: { color: colors.textFaint, fontSize: 11.5, marginTop: 1 },
  headerDots: { color: colors.textDim, fontSize: 24, paddingHorizontal: 2 },
  timerPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(201,164,255,0.12)",
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  timerCritical: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.4)",
  },
  timerText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  bubbleRow: { flexDirection: "row", marginBottom: 10 },
  bubble: {
    maxWidth: "80%",
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  bubbleAnon: {
    backgroundColor: colors.bgCardStrong,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 6,
  },
  bubbleText: { color: "#fff", fontSize: 15, lineHeight: 21 },
  bubbleTime: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  sendError: {
    color: colors.dangerSoft,
    textAlign: "center",
    fontSize: 12.5,
    paddingBottom: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 15,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: { color: "#fff", fontSize: 17, marginLeft: 2 },
});
