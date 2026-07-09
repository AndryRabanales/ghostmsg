// src/components/NotesClothesline.jsx
"use client";
import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

// Ligeras inclinaciones tipo "notas de Instagram" para dar vida al tendedero.
const TILTS = [-3, 2, -2, 3, -1.5, 2.5, -2.5, 1.5];

// Máximo de letras que caben cómodas en una notita (más compacta).
const NOTE_MAX_CHARS = 64;

function fitToNote(text) {
  const t = (text || "").trim();
  if (t.length <= NOTE_MAX_CHARS) return t;
  return t.slice(0, NOTE_MAX_CHARS).trimEnd() + "…";
}

/**
 * Tendedero horizontal de notitas recibidas (solo texto + alias, sin foto).
 * Estilo "notas de Instagram": burbujas que se desplazan con scroll horizontal.
 */
export default function NotesClothesline({ publicId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!publicId) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API}/public/${publicId}/notes`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (alive) setNotes(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setNotes([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [publicId]);

  // Muestra la flecha de desliz solo si hay contenido que no cabe y no se ha
  // llegado al final.
  const updateHint = () => {
    const el = trackRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth - el.clientWidth > 8;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    setShowHint(hasOverflow && !atEnd);
  };

  useEffect(() => {
    updateHint();
    window.addEventListener("resize", updateHint);
    return () => window.removeEventListener("resize", updateHint);
  }, [notes]);

  // Sin notas todavía: no ocupamos espacio.
  if (loading || notes.length === 0) return null;

  return (
    <section className="clothesline">
      <div className="clothesline-head">
        <span className="clothesline-title">Notitas recibidas</span>
        <span className="clothesline-count">{notes.length}</span>
      </div>
      <div className="clothesline-viewport">
        <div className="clothesline-track" ref={trackRef} onScroll={updateHint}>
          {notes.map((n, i) => (
            <div
              className="clothesline-note"
              key={n.id}
              style={{ transform: `rotate(${TILTS[i % TILTS.length]}deg)` }}
            >
              <span className="clothesline-note-pin" />
              <p className="clothesline-note-text">{fitToNote(n.content)}</p>
              <span className="clothesline-note-alias">— {n.alias}</span>
            </div>
          ))}
        </div>
        <div className={`clothesline-swipe ${showHint ? "is-visible" : ""}`} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </div>
      </div>
    </section>
  );
}
