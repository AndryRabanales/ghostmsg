// src/components/EditProfile.jsx
"use client";
import { useRef, useState } from "react";
import { getAuthHeaders } from "@/utils/auth";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

const DEFAULT_ALIAS = "Ej. Fan secreto, Vecino curioso...";
const DEFAULT_MESSAGE = "Dime qué piensas de mí...";

const VIEW = 220;   // tamaño del recuadro de ajuste (px)
const OUT = 256;    // tamaño final del avatar (px)

export default function EditProfile({ creator, onSaved }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(creator?.name || "");
  const [aliasPrompt, setAliasPrompt] = useState(creator?.aliasPrompt || "");
  const [messagePrompt, setMessagePrompt] = useState(creator?.messagePrompt || "");
  const [avatarUrl, setAvatarUrl] = useState(creator?.avatarUrl || null);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState("");

  // --- Ajustador de foto (mover + zoom dentro del círculo) ---
  const [photoSrc, setPhotoSrc] = useState(null); // imagen en edición
  const [imgNat, setImgNat] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const previewImgRef = useRef(null);

  const baseScale = imgNat.w
    ? VIEW / Math.min(imgNat.w, imgNat.h)
    : 1;

  // Mantiene la imagen siempre cubriendo el recuadro (sin huecos).
  const clampOffset = (off, z) => {
    const dW = imgNat.w * baseScale * z;
    const dH = imgNat.h * baseScale * z;
    return {
      x: Math.min(0, Math.max(VIEW - dW, off.x)),
      y: Math.min(0, Math.max(VIEW - dH, off.y)),
    };
  };

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
        const bs = VIEW / Math.min(img.width, img.height);
        const dW = img.width * bs;
        const dH = img.height * bs;
        setImgNat({ w: img.width, h: img.height });
        setZoom(1);
        setOffset({ x: (VIEW - dW) / 2, y: (VIEW - dH) / 2 }); // centrada
        setPhotoSrc(ev.target.result);
        setStatus("idle");
        setErrorMsg("");
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // permite re-elegir la misma foto
  };

  const onZoomChange = (val) => {
    const z = Number(val);
    // Zoom centrado: mantiene fijo el punto del centro del recuadro.
    const cx = (VIEW / 2 - offset.x) / (baseScale * zoom);
    const cy = (VIEW / 2 - offset.y) / (baseScale * zoom);
    const nextOff = {
      x: VIEW / 2 - cx * baseScale * z,
      y: VIEW / 2 - cy * baseScale * z,
    };
    setZoom(z);
    setOffset(clampOffset(nextOff, z));
  };

  const onPanDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPanMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const next = { x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) };
    setOffset(clampOffset(next, zoom));
  };
  const onPanUp = () => { dragRef.current = null; };

  const applyCrop = () => {
    const imgEl = previewImgRef.current;
    if (!imgEl) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    // Región de la imagen (en px naturales) que cae dentro del recuadro.
    const s = baseScale * zoom;
    const srcX = -offset.x / s;
    const srcY = -offset.y / s;
    const srcSide = VIEW / s;
    ctx.drawImage(imgEl, srcX, srcY, srcSide, srcSide, 0, 0, OUT, OUT);
    setAvatarUrl(canvas.toDataURL("image/jpeg", 0.72));
    setPhotoSrc(null);
  };

  const cancelCrop = () => setPhotoSrc(null);

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
        {photoSrc ? (
          <div className="photo-cropper">
            <div
              className="crop-viewport"
              style={{ width: VIEW, height: VIEW }}
              onPointerDown={onPanDown}
              onPointerMove={onPanMove}
              onPointerUp={onPanUp}
              onPointerLeave={onPanUp}
            >
              <img
                ref={previewImgRef}
                src={photoSrc}
                alt="Ajusta tu foto"
                draggable={false}
                className="crop-img"
                style={{
                  width: imgNat.w * baseScale * zoom,
                  height: imgNat.h * baseScale * zoom,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
              <div className="crop-ring" />
            </div>
            <div className="crop-controls">
              <span className="crop-zoom-icon">🔍</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => onZoomChange(e.target.value)}
                className="crop-zoom"
              />
            </div>
            <p className="crop-hint">Arrastra para mover · desliza para el zoom</p>
            <div className="crop-actions">
              <button type="button" className="crop-cancel" onClick={cancelCrop}>Cancelar</button>
              <button type="button" className="crop-apply" onClick={applyCrop}>Aplicar</button>
            </div>
          </div>
        ) : (
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
        )}

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
