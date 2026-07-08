// src/components/AnonMessageForm.jsx
"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

export default function AnonMessageForm({
  publicId,
  onChatCreated,
  creatorName
}) {
  const [content, setContent] = useState("");
  const [alias, setAlias] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

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
  const counterClass =
    charCount >= 500 ? "char-counter is-at-limit" :
    charCount >= 420 ? "char-counter is-near-limit" : "char-counter";

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

  return (
    <div className="anon-form-container mounted">
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
          <input
            type="text"
            placeholder="Tu alias (opcional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="form-input-field"
            maxLength="30"
          />
          <textarea
            placeholder="Dime que piensas de mi"
            value={content}
            onChange={(e) => { setContent(e.target.value); setCharCount(e.target.value.length); }}
            className="form-input-field"
            rows="4"
            maxLength="500"
          ></textarea>

          {imageBase64 && (
            <div className="media-preview">
              {mediaType === 'video' ? (
                <video src={imageBase64} controls />
              ) : (
                <img src={imageBase64} alt="Adjunto" />
              )}
            </div>
          )}

          <div className="form-toolbar">
            <div>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                id="image-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {imageBase64 ? (
                <label htmlFor="image-upload" className={attachChipClass}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {attachLabel}
                  <button
                    type="button"
                    className="attach-remove"
                    onClick={(e) => { e.preventDefault(); clearMedia(); }}
                    aria-label="Quitar adjunto"
                  >
                    ✕
                  </button>
                </label>
              ) : (
                <label htmlFor="image-upload" className={attachChipClass}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {attachLabel}
                </label>
              )}
            </div>
            <div className={counterClass}>{charCount} / 500</div>
          </div>

          <button type="submit" disabled={isDisabled} className="submit-button">
            {status === "loading" && <span className="submit-spinner" />}
            {status === "loading" ? "Enviando..." : "Enviar Mensaje"}
          </button>
        </form>
      )}

      {status === "error" && (
        <div className="form-status-message error"><p>{errorMsg}</p></div>
      )}
    </div>
  );
}
