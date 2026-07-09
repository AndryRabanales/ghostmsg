// src/components/MessageList.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { refreshToken } from "@/utils/auth";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

const IconResponder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
const IconVer = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const IconDots = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
  </svg>
);

// --- SUBCOMPONENTE ChatItem (SIMPLIFICADO) ---
const ChatItem = ({ chat, onOpenChat, isOnline, isArchivedView, menuOpen, onToggleMenu, onArchive, onDelete }) => {
  const preview = chat.previewMessage;
  const btnRef = useRef(null);
  const [menuPos, setMenuPos] = useState(null);

  // Posiciona el menú (portal a body) justo debajo del botón ⋯.
  useEffect(() => {
    if (menuOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    } else {
      setMenuPos(null);
    }
  }, [menuOpen]);

  const getButtonContent = () => {
    if (chat.anonReplied) {
      return (
        <>
          <IconResponder />
          Responder
        </>
      );
    }
    if (chat.isOpened) {
      return (<><IconVer />Ver</>);
    }
    // Por defecto (aunque no esté abierto, ahora se puede responder siempre)
    return (
      <>
        <IconResponder />
        Responder
      </>
    );
  };

  const alias = chat.anonAlias || "Anónimo";
  const initial = alias.trim().charAt(0).toUpperCase();
  const dateStr = new Date(preview ? preview.createdAt : chat.createdAt)
    .toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`chat-item ${chat.anonReplied ? 'new-reply' : ''} ${!chat.isOpened ? 'unopened' : ''}`}
      onClick={() => onOpenChat(chat.id)}
    >
      <div className={`chat-item-avatar ${isOnline ? 'is-online' : ''}`}>
        {initial}
      </div>

      <div className="chat-item-main">
        <div className="chat-item-toprow">
          <span className="chat-item-alias">{alias}</span>
          <span className="chat-item-date">{dateStr}</span>
        </div>
        <div className="chat-item-content">
          {chat.anonReplied && <span className="new-reply-indicator">Nuevo</span>}
          {preview ? (
            <>
              {preview.imageUrl && (
                <span className="chat-item-media">
                  {preview.mediaType === 'video' ? '🎥' : '📷'}
                </span>
              )}
              {preview.content}
            </>
          ) : "Chat iniciado, sin mensajes"}
        </div>
      </div>

      <div className="chat-item-actions" onClick={(e) => e.stopPropagation()}>
        <button className="chat-item-button" onClick={() => onOpenChat(chat.id)}>
          {getButtonContent()}
        </button>
        <button
          ref={btnRef}
          className="chat-item-menu-btn"
          onClick={(e) => { e.stopPropagation(); onToggleMenu(chat.id); }}
          aria-label="Opciones"
        >
          <IconDots />
        </button>
      </div>

      {menuOpen && menuPos && createPortal(
        <>
          <div className="chat-menu-backdrop" onClick={(e) => { e.stopPropagation(); onToggleMenu(null); }} />
          <div
            className="chat-menu-pop"
            style={{ top: menuPos.top, right: menuPos.right }}
            onClick={(e) => e.stopPropagation()}
          >
            {isArchivedView ? (
              <button onClick={() => onArchive(chat.id, false)}>♻️ Restaurar</button>
            ) : (
              <button onClick={() => onArchive(chat.id, true)}>🗂 Archivar</button>
            )}
            <button className="is-danger" onClick={() => onDelete(chat.id)}>🗑 Borrar</button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};


// --- Icono de Fantasma para la bandeja vacía ---
const EmptyInboxIcon = () => (
  <svg className="empty-inbox-icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.29241 12.7238C4.24584 10.2965 5.06019 7.40698 7.12053 5.61865C9.18087 3.83032 12.0673 3.36383 14.545 4.39088C17.0227 5.41793 18.6739 7.74542 18.7198 10.4387C18.7656 13.1319 17.2023 15.5168 14.809 16.67L15 18H9C6.46667 18 5 19.4667 5 22H19V21.5C18.0253 20.5222 17.5025 19.2433 17.5 17.9142C17.5 16.5 18 15 19 14C19 14 19 11 17 10C15 9 14 10 14 10C14 10 13 8 11 9C9 10 8 12 8 12C6.89543 12 6 12.8954 6 14C6 15.1046 6.89543 16 8 16H9.1909C6.79773 14.8432 5.23444 12.4583 5.29241 9.76506C5.35038 7.07183 6.97728 4.74433 9.45498 3.71728C11.9327 2.69023 14.8191 3.15672 16.8795 4.94505C18.9398 6.73338 19.7542 9.62291 18.7076 12.0502" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- COMPONENTE PRINCIPAL MessageList ---
export default function MessageList({ dashboardId }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("active"); // 'active' | 'archived'
  const [menuId, setMenuId] = useState(null);

  // Estado para los anónimos en línea
  const [anonStatuses, setAnonStatuses] = useState({});

  const router = useRouter();
  const wsRef = useRef(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const getAuthHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : { Authorization: `Bearer ${localStorage.getItem("token")}` };
  const handleAuthFailure = () => { localStorage.clear(); router.push("/login?session=expired"); };

  // --- fetchData (Simplificado) ---
  const fetchData = async (token) => {
    if (!dashboardId) return;
    try {
      const headers = getAuthHeaders(token);
      const archivedParam = viewRef.current === "archived" ? "1" : "0";
      const [meRes, chatsRes] = await Promise.all([
        fetch(`${API}/creators/me`, { headers, cache: 'no-store' }),
        fetch(`${API}/dashboard/${dashboardId}/chats?archived=${archivedParam}`, { headers, cache: 'no-store' })
      ]);

      if (meRes.status === 401 || chatsRes.status === 401) {
        const newToken = await refreshToken(localStorage.getItem("publicId"));
        if (newToken) { fetchData(newToken); } else { handleAuthFailure(); }
        return;
      }

      if (chatsRes.ok) {
        const data = await chatsRes.json();
        setChats(data);
      } else {
        throw new Error("Error cargando chats");
      }
    } catch (err) {
      console.error("Error en fetchData:", err);
      setError("⚠️ Error al cargar tus chats. Intenta refrescar la página.");
    } finally {
      setLoading(false);
    }
  };

  // Archivar / restaurar un chat (persiste en BD).
  const handleArchive = async (chatId, archived) => {
    setMenuId(null);
    setChats((prev) => prev.filter((c) => c.id !== chatId)); // sale de la vista actual
    try {
      await fetch(`${API}/dashboard/${dashboardId}/chats/${chatId}/archive`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
    } catch (err) {
      console.error("Error archivando:", err);
      fetchData();
    }
  };

  // Borrar un chat (lo abandona: se elimina para ambos). Pide confirmación.
  const handleDelete = async (chatId) => {
    setMenuId(null);
    if (!window.confirm("¿Borrar este chat? Se eliminará para siempre y abandonarás la conversación.")) return;
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    try {
      await fetch(`${API}/dashboard/${dashboardId}/chats/${chatId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error("Error borrando:", err);
      fetchData();
    }
  };

  // --- handleOpenChat (Simplificado) ---
  const handleOpenChat = async (chatId) => {
    try {
      const res = await fetch(`${API}/dashboard/${dashboardId}/chats/${chatId}/open`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo abrir el chat");
        return;
      }

      router.push(`/dashboard/${dashboardId}/chats/${chatId}`);
    } catch (err) {
      console.error("Error al abrir chat:", err);
      alert("⚠️ Error de red al intentar abrir el chat.");
    }
  };

  // Carga inicial y al cambiar de vista (activos / archivados).
  useEffect(() => {
    setLoading(true);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId, view]);

  // --- useEffect (WebSocket) ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay token para la conexión WS, abortando.");
      return;
    }

    const wsUrl = `${API.replace(/^http/, "ws")}/ws?dashboardId=${dashboardId}&token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 1. Manejador de nuevos mensajes
      if (data.type === 'new_message' || data.type === 'message') {
        fetchData();
      }

      // 2. Manejador de estado del anónimo
      if (data.type === 'ANON_STATUS_UPDATE') {
        console.log("WS (Dashboard) Status Update Recibido:", data);
        setAnonStatuses(prev => ({
          ...prev,
          [data.chatId]: data.status // 'online' o 'offline'
        }));
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId]);

  const animationStyle = (index) => ({
    animation: `fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
    animationDelay: `${0.1 * index}s`,
    opacity: 0,
  });

  const isArchivedView = view === "archived";

  return (
    <div>
      <div className="inbox-header-row">
        <h2 className="inbox-title">
          {isArchivedView ? "Archivados" : "Bandeja de Entrada"}
          {chats.length > 0 && <span className="inbox-count">{chats.length}</span>}
        </h2>
        <button
          className="inbox-view-toggle"
          onClick={() => { setMenuId(null); setView(isArchivedView ? "active" : "archived"); }}
        >
          {isArchivedView ? "← Volver a la bandeja" : "🗂 Archivados"}
        </button>
      </div>
      {loading && <p style={{ textAlign: 'center' }}>Cargando chats...</p>}
      {error && <p style={{ color: "#FE3C72", textAlign: 'center' }}>{error}</p>}

      {!loading && chats.length === 0 && (
        <div className="empty-inbox-container fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="empty-inbox-icon-ring">
            <EmptyInboxIcon />
          </div>
          {isArchivedView ? (
            <>
              <p className="empty-inbox-title">No tienes chats archivados</p>
              <p className="empty-inbox-subtitle">Los chats que archives aparecerán aquí.</p>
            </>
          ) : (
            <>
              <p className="empty-inbox-title">Tu espacio secreto está silencioso</p>
              <p className="empty-inbox-subtitle">¡Comparte tu link público para que la conversación comience!</p>
            </>
          )}
        </div>
      )}

      {!loading && chats.length > 0 && (
        <div>
          {chats.map((c, i) => (
            <div key={c.id} style={animationStyle(i)}>
              <ChatItem
                chat={c}
                onOpenChat={handleOpenChat}
                isOnline={anonStatuses[c.id] === 'online'}
                isArchivedView={isArchivedView}
                menuOpen={menuId === c.id}
                onToggleMenu={(id) => setMenuId((cur) => (cur === id ? null : id))}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}