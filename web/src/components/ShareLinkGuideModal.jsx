// src/components/ShareLinkGuideModal.jsx
"use client";
import React, { useEffect, useState } from "react";

const SHARE_TEXT = "Mándame un mensaje anónimo 👻 — dime lo que piensas de mí, nadie sabrá que fuiste tú.";

const STEPS = [
  { n: "1", text: "Copia tu link con el botón de arriba." },
  { n: "2", text: "Abre Instagram y crea una Historia con tu foto." },
  { n: "3", text: "Toca el sticker “Enlace” 🔗 y pega tu link." },
  { n: "4", text: "Publica y espera tus mensajes anónimos." },
];

export default function ShareLinkGuideModal({ onClose, publicLink }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* algunos navegadores bloquean clipboard sin gesto seguro */
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${publicLink}`)}`, "_blank");
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`, "_blank");
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="share-modal-emoji">👻</div>
        <h2 className="share-modal-title">Comparte tu link</h2>
        <p className="share-modal-sub">
          Súbelo a tu <b>historia de Instagram</b> para recibir mensajes anónimos.
          Solo hay que copiarlo y pegarlo.
        </p>

        {/* Paso principal: copiar */}
        <button
          className={`share-copy-hero ${copied ? "is-copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ¡Link copiado!
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copiar mi link
            </>
          )}
        </button>
        <div className="share-link-preview">{publicLink}</div>

        {/* Guía paso a paso */}
        <div className="share-steps">
          {STEPS.map((s) => (
            <div className="share-step" key={s.n}>
              <span className="share-step-num">{s.n}</span>
              <span className="share-step-text">{s.text}</span>
            </div>
          ))}
        </div>

        {/* Alternativas que sí llevan el link listo */}
        <div className="share-alt-label">o compártelo por</div>
        <div className="share-alt-row">
          <button className="share-alt share-alt--wa" onClick={handleWhatsApp}>
            <span className="share-alt-icon">💬</span> WhatsApp
          </button>
          <button className="share-alt share-alt--fb" onClick={handleFacebook}>
            <span className="share-alt-icon">👥</span> Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
