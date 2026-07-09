// src/components/AnonMessageForm.jsx
"use client";
import { useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";
const MAX_CHARS = 500;
const RING_RADIUS = 15;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function AnonMessageForm({
  publicId,
  onChatCreated,
  creatorName,
  aliasPrompt,
  messagePrompt
}) {
  const aliasPlaceholder = aliasPrompt || "Ej. Fan secreto, Vecino curioso...";
  const messagePlaceholder = messagePrompt || "Dime qué piensas de mí...";
  const [content, setContent] = useState("");
  const [alias, setAlias] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const cardRef = useRef(null);

  const handleSpotlight = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

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

  const clearMedia = () => {
    setImageBase64(null);
    setMediaType(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMsg("");

    if (file.type.startsWith('video/')) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg("El video no puede pesar más de 15MB.");
        return;
      }
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageBase64(event.target.result);
        setMediaType("video");
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("La imagen no puede pesar más de 5MB.");
        return;
      }
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageBase64(dataUrl);
          setMediaType("image");
          setIsProcessingImage(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMsg("Formato de archivo no soportado.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!content.trim() && !imageBase64) {
      setErrorMsg("Escribe un mensaje o adjunta un archivo.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(`${API}/public/${publicId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias: alias.trim() ? alias.trim() : "Anónimo",
          content,
          imageUrl: imageBase64 || null,
          mediaType: mediaType || null
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar el mensaje");

      try {
        const newChat = {
          chatId: data.chatId,
          anonToken: data.anonToken,
          anonAlias: alias.trim() ? alias.trim() : "Anónimo",
          creatorName: creatorName || "Creador",
          hasNewReply: false,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("myChats", JSON.stringify([newChat]));
      } catch (e) {
        console.error("Error guardando chat en myChats:", e);
      }

      setContent("");
      setAlias("");
      setCharCount(0);
      clearMedia();

      if (onChatCreated) {
        onChatCreated(data);
      } else {
        setStatus("success");
      }

    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const isDisabled = status === "loading" || (!content.trim() && !imageBase64);

  const attachLabel = isProcessingImage
    ? "Procesando..."
    : imageBase64
      ? (mediaType === 'video' ? 'Video adjunto' : 'Foto adjunta')
      : 'Adjuntar Foto/Video';

  const attachChipClass = [
    "attach-chip",
    imageBase64 ? "has-media" : "",
    isProcessingImage ? "is-processing" : ""
  ].filter(Boolean).join(" ");

  const initial = (creatorName || "?").trim().charAt(0).toUpperCase();
  const ringOffset = RING_CIRCUMFERENCE * (1 - Math.min(charCount, MAX_CHARS) / MAX_CHARS);
  const ringClass =
    charCount >= MAX_CHARS ? "char-ring is-at-limit" :
    charCount >= 420 ? "char-ring is-near-limit" :
    charCount > 0 ? "char-ring is-active" : "char-ring";

  return (
    <div className="anon-form-container mounted" ref={cardRef} onMouseMove={handleSpotlight}>
      <div className="anon-form-header">
        <div className="anon-form-avatar">{initial}</div>
        <div className="anon-form-header-text">
          <h1>Enviar a {creatorName}</h1>
          <span>🔒 100% anónimo</span>
        </div>
      </div>

      {status === "success" ? (
        <div className="success-panel">
          <div className="success-panel-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>¡Mensaje enviado!</h3>
          <p>Te avisaremos por email cuando haya una respuesta.</p>
          <button className="success-panel-again" onClick={() => setStatus("idle")}>
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form-element-group">
          <div className="form-field-group">
            <label className="form-field-label">
              <span className="form-field-label-icon">👤</span>
              Tu alias <span className="form-field-label-optional">(opcional)</span>
            </label>
            <div className="input-icon-wrap">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder={aliasPlaceholder}
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="form-input-field has-icon attention-pulse"
                maxLength="30"
              />
            </div>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">
              <span className="form-field-label-icon">💬</span>
              Tu mensaje
            </label>
            <textarea
              placeholder={messagePlaceholder}
              value={content}
              onChange={(e) => { setContent(e.target.value); setCharCount(e.target.value.length); }}
              className="form-input-field attention-pulse"
              rows="4"
              maxLength="500"
            ></textarea>
          </div>

          <div className="form-toolbar form-toolbar--end">
            <div className={ringClass} title={`${charCount} / ${MAX_CHARS}`}>
              <svg width="34" height="34" viewBox="0 0 34 34">
                <circle className="char-ring-track" cx="17" cy="17" r={RING_RADIUS} />
                <circle
                  className="char-ring-fill"
                  cx="17" cy="17" r={RING_RADIUS}
                  style={{
                    strokeDasharray: RING_CIRCUMFERENCE,
                    strokeDashoffset: ringOffset
                  }}
                />
              </svg>
              <span className="char-ring-label">{MAX_CHARS - charCount}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="submit-button"
            onMouseDown={handleRipple}
          >
            {status === "loading" ? (
              <span className="submit-spinner" />
            ) : (
              <svg className="submit-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
            <span>{status === "loading" ? "Enviando..." : "Enviar Mensaje"}</span>
          </button>
        </form>
      )}

      {status === "error" && (
        <div className="form-status-message error"><p>{errorMsg}</p></div>
      )}
    </div>
  );
}
