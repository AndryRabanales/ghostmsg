// src/components/EditProfile.jsx
"use client";
import { useState } from "react";
import { getAuthHeaders } from "@/utils/auth";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

const DEFAULT_ALIAS = "Ej. Fan secreto, Vecino curioso...";
const DEFAULT_MESSAGE = "Dime qué piensas de mí...";

export default function EditProfile({ creator, onSaved }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(creator?.name || "");
  const [aliasPrompt, setAliasPrompt] = useState(creator?.aliasPrompt || "");
  const [messagePrompt, setMessagePrompt] = useState(creator?.messagePrompt || "");
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("El nombre no puede estar vacío.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/creators/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name: name.trim(),
          aliasPrompt: aliasPrompt.trim(),
          messagePrompt: messagePrompt.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
      setStatus("saved");
      if (onSaved) onSaved(data);
      setTimeout(() => {
        setStatus("idle");
        setOpen(false);
      }, 900);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  if (!open) {
    return (
      <button className="edit-profile-trigger" onClick={() => setOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Editar perfil
      </button>
    );
  }

  return (
    <div className="edit-profile-panel">
      <div className="edit-profile-head">
        <h3>Editar perfil</h3>
        <button className="edit-profile-close" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
      </div>

      <form onSubmit={handleSave} className="edit-profile-form">
        <label className="edit-profile-label">
          Tu nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="edit-profile-input"
            placeholder="Tu nombre"
          />
          <span className="edit-profile-hint">Aparece como “Enviar a {name || "…"}” en tu página.</span>
        </label>

        <label className="edit-profile-label">
          Texto del alias
          <input
            type="text"
            value={aliasPrompt}
            onChange={(e) => setAliasPrompt(e.target.value)}
            maxLength={80}
            className="edit-profile-input"
            placeholder={DEFAULT_ALIAS}
          />
          <span className="edit-profile-hint">Sugerencia dentro del campo “Tu alias”.</span>
        </label>

        <label className="edit-profile-label">
          Texto del mensaje
          <input
            type="text"
            value={messagePrompt}
            onChange={(e) => setMessagePrompt(e.target.value)}
            maxLength={120}
            className="edit-profile-input"
            placeholder={DEFAULT_MESSAGE}
          />
          <span className="edit-profile-hint">La pregunta que verán, ej. “¿Qué piensas de mí?”.</span>
        </label>

        {status === "error" && <p className="edit-profile-error">{errorMsg}</p>}

        <button type="submit" className="edit-profile-save" disabled={status === "saving"}>
          {status === "saving" ? "Guardando..." : status === "saved" ? "¡Guardado! ✓" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
