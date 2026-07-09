// src/app/u/[publicId]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AnonMessageForm from "@/components/AnonMessageForm";
import AnonChatsBadge from "@/components/AnonChatsBadge";
import NotesClothesline from "@/components/NotesClothesline";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

export default function PublicUserPage() {
  const params = useParams();
  const router = useRouter();
  // Manejo seguro de params.publicId
  const publicId = params?.publicId;

  const [creatorInfo, setCreatorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // El anónimo va DIRECTO al formulario (cero fricción), aunque esté dentro de
  // Instagram. Solo el creador (crear cuenta) necesita salir al navegador real.

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

      <NotesClothesline publicId={publicId} />

      <a href="/descargar" className="anon-cta">
        <span className="anon-cta-ghost">👻</span>
        <span className="anon-cta-text">
          <b>¿Tú también quieres recibir mensajes anónimos?</b>
          Crea tu cuenta gratis
        </span>
        <svg className="anon-cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </div>
  );
}