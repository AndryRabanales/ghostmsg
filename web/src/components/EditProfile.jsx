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
  const [avatarUrl, setAvatarUrl] = useState(creator?.avatarUrl || null);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Selecciona una imagen.");
      setStatus("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Recorta al centro en un cuadrado y comprime (avatar pequeño).
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        setAvatarUrl(canvas.toDataURL("image/jpeg", 0.72));
        setStatus("idle");
        setErrorMsg("");
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

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
          avatarUrl: avatarUrl,
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
        <div className="edit-profile-photo-row">
          <div className="edit-profile-photo">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Tu foto" />
            ) : (
              <span>{(name || "?").trim().charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="edit-profile-photo-actions">
            <label className="edit-profile-photo-btn">
              {avatarUrl ? "Cambiar foto" : "Subir foto"}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </label>
            {avatarUrl && (
              <button type="button" className="edit-profile-photo-remove" onClick={() => setAvatarUrl(null)}>
                Quitar
              </button>
            )}
          </div>
        </div>

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
