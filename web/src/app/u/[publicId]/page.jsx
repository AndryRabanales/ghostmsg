// src/app/u/[publicId]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AnonMessageForm from "@/components/AnonMessageForm";
import AnonChatsBadge from "@/components/AnonChatsBadge";
import { isInAppBrowser, tryEscapeToRealBrowser } from "@/utils/inAppBrowser";
import { openStore } from "@/utils/appStore";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

// Constants removed

export default function PublicUserPage() {
  const params = useParams();
  const router = useRouter();
  // Manejo seguro de params.publicId
  const publicId = params?.publicId;

  const [creatorInfo, setCreatorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inApp, setInApp] = useState(false);
  const [continueHere, setContinueHere] = useState(false);
  const [escapeTried, setEscapeTried] = useState(false);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  const handleEscape = () => {
    const ok = tryEscapeToRealBrowser(window.location.href);
    if (!ok) {
      setContinueHere(true);
      return;
    }
    setEscapeTried(true);
    // Si el salto falló (iOS lo bloqueó), revela la opción de continuar aquí.
    setTimeout(() => setEscapeTried(true), 1500);
  };

  // Carga los datos del creador
  useEffect(() => {
    if (publicId) {
      const fetchData = async () => {
        try {
          const res = await fetch(`${API}/public/creator/${publicId}`);
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "No se pudo cargar la información del creador.");
          }
          const data = await res.json();
          setCreatorInfo(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [publicId]);

  // Redirección al crear chat
  const handleChatCreated = (newChatEntry) => {
    if (newChatEntry.anonToken && newChatEntry.chatId) {
      router.push(`/chats/${newChatEntry.anonToken}/${newChatEntry.chatId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: '100px', fontFamily: 'monospace' }}>
        Cargando espacio...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#ff7b7b', textAlign: 'center', paddingTop: '100px', fontFamily: 'monospace' }}>
        Error: {error}
      </div>
    );
  }

  if (!creatorInfo) {
    return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: '100px', fontFamily: 'monospace' }}>
        Creador no encontrado.
      </div>
    );
  }

  // --- Pantalla de escape de Instagram/Facebook (opción B) ---
  if (inApp && !continueHere) {
    return (
      <div className="anon-page-wrap">
        <div className="ig-escape-card">
          <div className="ig-escape-icon">🌐</div>
          <h2 className="ig-escape-title">Ábrelo en tu navegador</h2>
          <p className="ig-escape-text">
            Estás dentro de <b>Instagram</b>. Para escribirle a{" "}
            <b>{creatorInfo.creatorName}</b> y poder ver su respuesta después,
            ábrelo en tu navegador.
          </p>
          <button className="ig-escape-btn" onClick={handleEscape}>
            🌐 Abrir en mi navegador
          </button>

          {escapeTried && (
            <p className="ig-escape-manual">
              ¿No se abrió? Toca <b>⋯</b> (arriba a la derecha) y elige{" "}
              <b>“Abrir en el navegador”</b>.
            </p>
          )}

          <button className="ig-escape-stay" onClick={() => setContinueHere(true)}>
            Continuar aquí de todos modos
          </button>
        </div>
      </div>
    );
  }

  // Renderizado Principal
  return (
    <div className="anon-page-wrap">
      <AnonChatsBadge newMessagePublicId={publicId} />
      <AnonMessageForm
        publicId={publicId}
        onChatCreated={handleChatCreated}
        creatorName={creatorInfo.creatorName}
        aliasPrompt={creatorInfo.aliasPrompt}
        messagePrompt={creatorInfo.messagePrompt}
        avatarUrl={creatorInfo.avatarUrl}
      />

      <a
        href="/descargar"
        className="anon-cta"
        onClick={(e) => {
          // Detecta el dispositivo y abre la tienda directo si ya está publicada;
          // si no, deja pasar al /descargar.
          if (openStore()) e.preventDefault();
        }}
      >
        <span className="anon-cta-ghost">👻</span>
        <span className="anon-cta-text">
          <b>¿Tú también quieres recibir mensajes anónimos?</b>
          Descarga GhostMsg y crea tu link gratis
        </span>
        <svg className="anon-cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </div>
  );
}