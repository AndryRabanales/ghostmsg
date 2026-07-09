// src/components/AnonChatsBadge.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Insignia flotante (arriba-derecha) con el número de chats que el anónimo
 * ha creado. Al tocarla, despliega la lista de sus chats y un acceso para
 * escribir un mensaje nuevo. Lee de localStorage.myChats.
 */
export default function AnonChatsBadge({ newMessagePublicId, currentChatId }) {
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("myChats") || "[]");
      stored.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setChats(stored);
    } catch {
      setChats([]);
    }
  }, [currentChatId]);

  if (chats.length === 0) return null;

  const goNew = () => {
    const pid = newMessagePublicId || chats[0]?.publicId;
    if (pid) router.push(`/u/${pid}`);
    setOpen(false);
  };

  return (
    <div className="anon-badge-wrap">
      <button className="anon-badge" onClick={() => setOpen((v) => !v)} aria-label="Mis chats">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="anon-badge-count">{chats.length}</span>
      </button>

      {open && (
        <>
          <div className="anon-badge-backdrop" onClick={() => setOpen(false)} />
          <div className="anon-badge-panel">
            <div className="anon-badge-panel-head">Tus mensajes ({chats.length})</div>
            <div className="anon-badge-list">
              {chats.map((c) => (
                <button
                  key={c.chatId}
                  className={`anon-badge-item ${c.chatId === currentChatId ? "is-active" : ""}`}
                  onClick={() => {
                    router.push(`/chats/${c.anonToken}/${c.chatId}`);
                    setOpen(false);
                  }}
                >
                  <span className="anon-badge-item-avatar">
                    {(c.creatorName || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="anon-badge-item-text">
                    <b>{c.creatorName || "Creador"}</b>
                    <span>como {c.anonAlias || "Anónimo"}</span>
                  </span>
                  {c.hasNewReply && <span className="anon-badge-dot" />}
                </button>
              ))}
            </div>
            <button className="anon-badge-new" onClick={goNew}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Escribir nuevo mensaje
            </button>
          </div>
        </>
      )}
    </div>
  );
}
