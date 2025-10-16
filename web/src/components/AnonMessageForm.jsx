// src/components/AnonMessageForm.jsx
"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API || "https://ghost-api-production.up.railway.app";

export default function AnonMessageForm({ publicId, onSent }) {
  const [alias, setAlias] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim().length < 3) {
      setErrorMsg("El mensaje debe tener al menos 3 caracteres.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${API}/public/${publicId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error enviando el mensaje");

      setStatus("success");
      
      if (data.chatId && data.anonToken) {
        const myChats = JSON.parse(localStorage.getItem("myChats") || "[]");
        
        // --- CAMBIO CLAVE AQUÍ ---
        // Ahora guardamos el alias que el usuario escribió.
        const newChatEntry = {
          chatId: data.chatId,
          anonToken: data.anonToken,
          creatorPublicId: publicId,
          preview: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
          ts: new Date().toISOString(),
          creatorName: "Conversación", // Mantenemos un nombre de creador por defecto
          anonAlias: alias || "Anónimo", // Guardamos el alias del anónimo
        };
        
        const updatedChats = [newChatEntry, ...myChats];
        localStorage.setItem("myChats", JSON.stringify(updatedChats));
      }
      
      setContent("");
      setCharCount(0);
      if (typeof onSent === "function") onSent();

    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <div className={`anon-form-container ${isMounted ? 'mounted' : ''}`}>
      <form onSubmit={handleSubmit} className="form-element-group">
        <input
          type="text"
          placeholder="Tu alias (opcional)"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="form-input-field"
        />
        <textarea
          placeholder="Escribe tu mensaje anónimo..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setCharCount(e.target.value.length);
          }}
          className="form-input-field"
          rows="4"
          maxLength="500"
        ></textarea>
        
        <div className="char-counter">
          {charCount} / 500
        </div>

        <button type="submit" disabled={status === "loading"} className="submit-button">
          {status === "loading" ? "Enviando..." : "Enviar Mensaje"}
        </button>
      </form>

      {status === "error" && (
        <div className="form-status-message error">
          <p>{errorMsg}</p>
        </div>
      )}


    </div>
  );
}