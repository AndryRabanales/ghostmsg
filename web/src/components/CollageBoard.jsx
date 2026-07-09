// src/components/CollageBoard.jsx
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { getAuthHeaders } from "@/utils/auth";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

const TILTS = [-4, 3, -2, 4, -3, 2, -1.5, 3.5, -4.5, 1.5, -2.5, 4.5];
const NOTE_W = 150;

export default function CollageBoard({ dashboardId, creatorName, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positions, setPositions] = useState({}); // { id: {x,y,z} }
  const [archived, setArchived] = useState({});   // { id: true }
  const [showArchived, setShowArchived] = useState(false);

  const boardRef = useRef(null);
  const zTop = useRef(20);
  const drag = useRef(null);

  const posKey = `gm_collage_pos_${dashboardId}`;
  const archKey = `gm_collage_arch_${dashboardId}`;

  // --- Cargar notas + estado guardado ---
  useEffect(() => {
    let savedPos = {}, savedArch = {};
    try { savedPos = JSON.parse(localStorage.getItem(posKey) || "{}"); } catch {}
    try { savedArch = JSON.parse(localStorage.getItem(archKey) || "{}"); } catch {}
    setArchived(savedArch);

    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API}/dashboard/${dashboardId}/collage`, {
          headers: getAuthHeaders(), cache: "no-store",
        });
        if (!res.ok) throw new Error("No se pudo cargar el collage.");
        const data = await res.json();
        setNotes(data);

        // Posición inicial compacta y superpuesta (si no hay guardada).
        const cols = 3;
        const pos = {};
        data.forEach((n, i) => {
          if (savedPos[n.id]) { pos[n.id] = savedPos[n.id]; return; }
          const col = i % cols, row = Math.floor(i / cols);
          pos[n.id] = {
            x: col * 118 + (Math.random() * 20 - 10),
            y: row * 78 + (Math.random() * 16 - 8),
            z: 10 + i,
          };
        });
        zTop.current = 20 + data.length;
        setPositions(pos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId]);

  const persistPos = useCallback((next) => {
    try { localStorage.setItem(posKey, JSON.stringify(next)); } catch {}
  }, [posKey]);

  const persistArch = (next) => {
    try { localStorage.setItem(archKey, JSON.stringify(next)); } catch {}
  };

  const bringToFront = (id) => {
    zTop.current += 1;
    setPositions((p) => ({ ...p, [id]: { ...p[id], z: zTop.current } }));
  };

  // --- Drag con pointer capture (mouse + touch) ---
  const onPointerDown = (e, id) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const cur = positions[id] || { x: 0, y: 0 };
    drag.current = { id, startX: e.clientX, startY: e.clientY, origX: cur.x, origY: cur.y };
    bringToFront(id);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const board = boardRef.current;
    const maxX = board ? board.clientWidth - NOTE_W : 9999;
    let x = d.origX + (e.clientX - d.startX);
    let y = d.origY + (e.clientY - d.startY);
    x = Math.max(0, Math.min(x, Math.max(0, maxX)));
    y = Math.max(0, y);
    setPositions((p) => ({ ...p, [d.id]: { ...p[d.id], x, y } }));
  };

  const onPointerUp = () => {
    if (drag.current) {
      drag.current = null;
      setPositions((p) => { persistPos(p); return p; });
    }
  };

  const archiveNote = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const next = { ...archived, [id]: true };
    setArchived(next);
    persistArch(next);
  };

  const restoreNote = (id) => {
    const next = { ...archived };
    delete next[id];
    setArchived(next);
    persistArch(next);
  };

  const visible = notes.filter((n) => !archived[n.id]);
  const archivedNotes = notes.filter((n) => archived[n.id]);

  return (
    <div className="collage-overlay">
      <div className="collage-topbar">
        <div className="collage-brand">
          <span className="collage-brand-ghost">👻</span>
          <span>GhostMsg</span>
        </div>
        <div className="collage-topbar-actions">
          {archivedNotes.length > 0 && (
            <button className="collage-arch-toggle" onClick={() => setShowArchived((v) => !v)}>
              🗂 {archivedNotes.length}
            </button>
          )}
          <button className="collage-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
      </div>

      <div className="collage-header">
        <h2 className="collage-title">Mensajes anónimos para {creatorName}</h2>
        <p className="collage-hint">✋ Arrástralas y acomódalas · 📸 captura para tu historia</p>
      </div>

      {loading && <p className="collage-state">Armando tu collage…</p>}
      {error && <p className="collage-state collage-state--error">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="collage-state">No hay mensajes en el tablero.</p>
      )}

      <div
        className="collage-board"
        ref={boardRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {visible.map((note, i) => {
          const p = positions[note.id] || { x: 0, y: 0, z: 10 };
          return (
            <div
              key={note.id}
              className="collage-note"
              onPointerDown={(e) => onPointerDown(e, note.id)}
              style={{
                left: 0, top: 0,
                transform: `translate(${p.x}px, ${p.y}px) rotate(${TILTS[i % TILTS.length]}deg)`,
                zIndex: p.z,
              }}
            >
              <span className="collage-note-pin" />
              <button
                className="collage-note-archive"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => archiveNote(e, note.id)}
                aria-label="Archivar"
                title="Archivar"
              >
                ✕
              </button>
              <p className="collage-note-text">{note.content}</p>
              <span className="collage-note-alias">— {note.alias}</span>
            </div>
          );
        })}
      </div>

      {showArchived && (
        <div className="collage-arch-drawer">
          <div className="collage-arch-drawer-head">
            <span>Archivados ({archivedNotes.length})</span>
            <button onClick={() => setShowArchived(false)} aria-label="Cerrar">✕</button>
          </div>
          <div className="collage-arch-list">
            {archivedNotes.map((n) => (
              <div className="collage-arch-item" key={n.id}>
                <p>{n.content}</p>
                <button onClick={() => restoreNote(n.id)}>Restaurar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
