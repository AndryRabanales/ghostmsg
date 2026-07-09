// src/app/descargar/page.jsx
"use client";
import Link from "next/link";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/utils/appStore";

export default function DescargarPage() {
  return (
    <div className="auth-container">
      <main className="auth-card">
        <div className="auth-mark">👻</div>
        <h1>Recibe mensajes anónimos</h1>
        <p className="auth-subtitle">
          Descarga GhostMsg, crea tu link y compártelo en tu historia.
          Descubre lo que otros piensan de ti, sin filtros.
        </p>

        <div className="download-stores">
          <a
            className={`download-store ${APP_STORE_URL ? "" : "is-soon"}`}
            href={APP_STORE_URL || undefined}
            target={APP_STORE_URL ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-disabled={!APP_STORE_URL}
            onClick={(e) => { if (!APP_STORE_URL) e.preventDefault(); }}
          >
            <span className="download-store-icon"></span>
            <span className="download-store-text">
              <small>{APP_STORE_URL ? "Descárgala en" : "Muy pronto en"}</small>
              App Store
            </span>
          </a>

          <a
            className={`download-store ${PLAY_STORE_URL ? "" : "is-soon"}`}
            href={PLAY_STORE_URL || undefined}
            target={PLAY_STORE_URL ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-disabled={!PLAY_STORE_URL}
            onClick={(e) => { if (!PLAY_STORE_URL) e.preventDefault(); }}
          >
            <span className="download-store-icon">▶</span>
            <span className="download-store-text">
              <small>{PLAY_STORE_URL ? "Disponible en" : "Muy pronto en"}</small>
              Google Play
            </span>
          </a>
        </div>

        <div className="download-web">
          <span>o empieza ahora mismo</span>
          <Link href="/" className="download-web-link">
            Crear mi cuenta gratis en la web →
          </Link>
        </div>
      </main>
    </div>
  );
}
