// src/components/CollageBoard.jsx
"use client";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/utils/auth";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

// Rotaciones sutiles para el efecto "notas pegadas".
const TILTS = [-3.5, 2.5, -1.5, 3, -2.5, 1.8, -3, 2.2, -1, 3.4];

export default function CollageBoard({ dashboardId, creatorName, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API}/dashboard/${dashboardId}/collage`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        if (!res.ok) throw new Error("No se pudo cargar el collage.");
        setNotes(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [dashboardId]);

  return (
    <div className="collage-overlay">
      <div className="collage-topbar">
        <div className="collage-brand">
          <span className="collage-brand-ghost">👻</span>
          <span>GhostMsg</span>
        </div>
        <button className="collage-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      <div className="collage-scroll">
        <div className="collage-header">
          <h2 className="collage-title">Mensajes anónimos para {creatorName}</h2>
          <p className="collage-hint">📸 Captura esta pantalla y súbela a tu historia.</p>
        </div>

        {loading && <p className="collage-state">Armando tu collage…</p>}
        {error && <p className="collage-state collage-state--error">{error}</p>}
        {!loading && !error && notes.length === 0 && (
          <p className="collage-state">Aún no tienes mensajes para el collage.</p>
        )}

        <div className="collage-grid">
          {notes.map((note, i) => (
            <div
              key={note.id}
              className="collage-note"
              style={{ "--tilt": `${TILTS[i % TILTS.length]}deg`, animationDelay: `${Math.min(i * 0.06, 1)}s` }}
            >
              <span className="collage-note-pin" />
              <p className="collage-note-text">{note.content}</p>
              <span className="collage-note-alias">— {note.alias}</span>
            </div>
          ))}
        </div>

        {!loading && notes.length > 0 && (
          <div className="collage-footer">ghostmsg.space</div>
        )}
      </div>
    </div>
  );
}
