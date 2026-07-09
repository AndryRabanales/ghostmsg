// src/app/descargar/page.jsx
"use client";
import { useEffect, useState } from "react";
import { isInAppBrowser } from "@/utils/inAppBrowser";

const SITE_URL = "https://ghost-web-production.up.railway.app/";

export default function DescargarPage() {
  const [copied, setCopied] = useState(false);
  const [showChrome, setShowChrome] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    // En Android SÍ se puede saltar al navegador de un toque (intent://).
    setShowChrome(/Android/i.test(ua) && isInAppBrowser());
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const openInChrome = () => {
    const bare = SITE_URL.replace(/^https?:\/\//, "");
    window.location.href = `intent://${bare}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  return (
    <div className="auth-container">
      <main className="auth-card">
        <div className="auth-mark">👻</div>
        <h1>Recibe mensajes anónimos</h1>
        <p className="auth-subtitle">
          {showChrome
            ? "Ábrelo en tu navegador para crear tu cuenta e iniciar sesión."
            : "Copia este enlace y ábrelo en el navegador de tu preferencia (Safari o Chrome) para crear tu cuenta e iniciar sesión."}
        </p>

        {showChrome && (
          <button className="create-copy-btn-lg create-chrome-btn" onClick={openInChrome}>
            🌐 Abrir en Chrome
          </button>
        )}

        <div className="create-link-box">
          <span className="create-link-url">{SITE_URL}</span>
        </div>

        <button className="create-copy-btn-lg" onClick={copyLink}>
          {copied ? "✅ ¡Enlace copiado!" : "📋 Copiar enlace"}
        </button>
      </main>
    </div>
  );
}
