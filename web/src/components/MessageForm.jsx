// src/components/MessageForm.jsx
"use client";
// --- 1. 'useState' ya estaba importado ---
import { useState } from "react";
import { refreshToken } from "@/utils/auth";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";


export default function MessageForm({
  dashboardId,
  chatId,
  onMessageSent,
  lastAnonQuestion
}) {
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const charCount = newMsg.length;

  // --- 2. CREA UNA INSTANCIA DE AUDIO (reutilizable) ---
  // Usamos useState para asegurarnos de que solo se cree una vez en el cliente.
  const [chachingSound, setChachingSound] = useState(null);

  useState(() => {
    // Esto solo se ejecutará en el cliente (client-side)
    if (typeof Audio !== "undefined") {
      setChachingSound(new Audio('/chaching.mp3'));
    }
  }, []);
  // --- FIN DE MODIFICACIÓN 2 ---

  const getAuthHeaders = (token) => {
    const t = token || localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      let res = await fetch(
        `${API}/dashboard/${dashboardId}/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ content: newMsg }),
        }
      );

      if (res.status === 401) {
        const newToken = await refreshToken(localStorage.getItem("publicId"));
        if (newToken) {
          res = await fetch(
            `${API}/dashboard/${dashboardId}/chats/${chatId}/messages`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", ...getAuthHeaders(newToken) },
              body: JSON.stringify({ content: newMsg }),
            }
          );
        }
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error enviando mensaje");
      }

      const msgData = await res.json();

      // --- 👇 3. REPRODUCE EL SONIDO AQUÍ 👇 ---
      if (chachingSound) {
        chachingSound.currentTime = 0; // Reinicia el sonido si se usa rápido
        chachingSound.play().catch(err => {
          console.warn("No se pudo reproducir el sonido 'cha-ching':", err);
        });
      }
      // --- 👆 FIN DE MODIFICACIÓN 3 👆 ---

      setNewMsg("");
      if (onMessageSent) onMessageSent(msgData);
    } catch (err) {
      console.error("Error en handleSend:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !newMsg.trim();

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.6;
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  };

  return (
    <>
      <div className="premium-reply-form">
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <div className="premium-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Escribe una respuesta..."
              className="premium-input"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="premium-send-btn"
            disabled={isDisabled || !newMsg.trim()}
            onMouseDown={handleRipple}
          >
            {loading ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            ) : (
              <>
                <span>Enviar</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </>
            )}
          </button>
        </form>
      </div>

      {/* --- (El resto del componente de error y guía no cambia) --- */}
      {error && (
        <div style={{
          fontSize: '13px',
          color: '#ff7b7b',
          textAlign: 'center',
          fontWeight: '600',
          marginTop: '10px',
          padding: '8px',
          background: 'rgba(255, 123, 123, 0.1)',
          borderRadius: '8px',
          border: '1px solid #ff7b7b'
        }}>
          {error}
        </div>
      )}


    </>
  );
}