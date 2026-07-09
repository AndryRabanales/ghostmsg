// src/components/ShareLinkGuideModal.jsx
"use client";
import React, { useEffect, useState } from "react";

const SHARE_TEXT = "Mándame un mensaje anónimo 👻 — dime lo que piensas de mí, nadie sabrá que fuiste tú.";

export default function ShareLinkGuideModal({ onClose, publicLink }) {
  const [copyText, setCopyText] = useState("Copiar");
  const [toast, setToast] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyButton = async () => {
    if (await copyLink()) {
      setCopyText("¡Copiado!");
      setTimeout(() => setCopyText("Copiar"), 2000);
    } else {
      setCopyText("Error");
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: "GhostMsg", text: SHARE_TEXT, url: publicLink });
    } catch {
      /* usuario canceló */
    }
  };

  const handleInstagram = async () => {
    await copyLink();
    showToast("Link copiado. Abre tu Historia, ponle tu foto y pégalo con el sticker de Enlace 🔗");
    // Abre la cámara de Historias de Instagram (si la app está instalada).
    window.location.href = "instagram://story-camera";
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${publicLink}`)}`;
    window.open(url, "_blank");
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="share-modal-emoji">👻</div>
        <h2 className="share-modal-title">Recibe mensajes anónimos</h2>
        <p className="share-modal-sub">
          Comparte tu link en tu <b>historia</b>. Quien lo toque podrá escribirte de forma
          100% anónima. Solo súbelo con tu foto y el sticker de enlace.
        </p>

        {canNativeShare && (
          <button className="share-modal-cta" onClick={handleNativeShare}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Compartir en mis redes
          </button>
        )}

        <div className="share-modal-networks">
          <button className="share-net share-net--ig" onClick={handleInstagram}>
            <span className="share-net-icon">📸</span>
            Instagram
          </button>
          <button className="share-net share-net--wa" onClick={handleWhatsApp}>
            <span className="share-net-icon">💬</span>
            WhatsApp
          </button>
          <button className="share-net share-net--fb" onClick={handleFacebook}>
            <span className="share-net-icon">👥</span>
            Facebook
          </button>
        </div>

        <div className="share-modal-linkrow">
          <input type="text" value={publicLink} readOnly className="share-modal-linkinput" />
          <button className="share-modal-copy" onClick={handleCopyButton}>{copyText}</button>
        </div>

        {toast && <div className="share-modal-toast">{toast}</div>}
      </div>
    </div>
  );
}
