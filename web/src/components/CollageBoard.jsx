// src/components/CollageBoard.jsx
"use client";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { getAuthHeaders } from "@/utils/auth";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

const TILTS = [-4, 3, -2, 4, -3, 2, -1.5, 3.5, -4.5, 1.5, -2.5, 4.5];

// Métricas responsive: en móvil las notas se achican para caber 3-4 por fila;
// en escritorio se mantienen grandes.
function metricsFor(boardW) {
  if (!boardW) return { noteW: 150, gap: 12 };
  if (boardW <= 520) {
    const gap = 8;
    const targetCols = boardW < 330 ? 3 : 4;
    const noteW = Math.floor((boardW - (targetCols - 1) * gap) / targetCols);
    return { noteW, gap };
  }
  return { noteW: 150, gap: 12 };
}

export default function CollageBoard({ dashboardId, creatorName, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positions, setPositions] = useState({}); // { id: {x,y,z} }
  const [archived, setArchived] = useState({});   // { id: true }
  const [showArchived, setShowArchived] = useState(false);
  const [contentH, setContentH] = useState(500);
  const [mounted, setMounted] = useState(false);
  const [boardW, setBoardW] = useState(0);

  const { noteW, gap } = metricsFor(boardW);

  // El overlay se monta en document.body (portal) para cubrir TODA la pantalla,
  // sin que ningún ancestro con transform/filter recorte el position:fixed.
  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const boardRef = useRef(null);
  const noteRefs = useRef({});
  const savedPosRef = useRef({});
  const laidOut = useRef(false);
  const zTop = useRef(20);
  const drag = useRef(null);
  const rotate = useRef(null);

  // v2: posiciones guardadas de forma relativa (fx 0..1) para ser convertibles
  // entre PC y móvil. La clave nueva ignora el formato viejo (px absolutos).
  const posKey = `gm_collage_pos_v2_${dashboardId}`;
  const archKey = `gm_collage_arch_${dashboardId}`;

  // Mide el ancho del board y lo actualiza al redimensionar / rotar el móvil.
  useEffect(() => {
    const measure = () => { if (boardRef.current) setBoardW(boardRef.current.clientWidth); };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [mounted]);

  // --- Cargar notas + estado guardado ---
  useEffect(() => {
    let savedPos = {}, savedArch = {};
    try { savedPos = JSON.parse(localStorage.getItem(posKey) || "{}"); } catch {}
    try { savedArch = JSON.parse(localStorage.getItem(archKey) || "{}"); } catch {}
    savedPosRef.current = savedPos;
    setArchived(savedArch);
    setPositions(savedPos); // las notas ya arrastradas conservan su lugar

    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API}/dashboard/${dashboardId}/collage`, {
          headers: getAuthHeaders(), cache: "no-store",
        });
        if (!res.ok) throw new Error("No se pudo cargar el collage.");
        const data = await res.json();
        zTop.current = 20 + data.length;
        // El servidor es la fuente de verdad del archivado (para que también
        // se oculten del tendedero público). Unimos con lo local por si acaso.
        const serverArch = {};
        data.forEach((n) => { if (n.hidden) serverArch[n.id] = true; });
        const merged = { ...savedArch, ...serverArch };
        setArchived(merged);
        try { localStorage.setItem(archKey, JSON.stringify(merged)); } catch {}
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId]);

  // --- Layout ordenado (masonry) por defecto, midiendo alturas reales ---
  useLayoutEffect(() => {
    if (loading || notes.length === 0 || laidOut.current || !boardW) return;

    const cols = Math.max(1, Math.floor((boardW + gap) / (noteW + gap)));
    const gridW = cols * noteW + (cols - 1) * gap;
    const startX = Math.max(8, (boardW - gridW) / 2);
    const colH = new Array(cols).fill(gap);
    const usable = Math.max(1, boardW - noteW); // rango horizontal para fx

    const saved = savedPosRef.current || {};
    const next = { ...saved };
    let z = 10;

    notes.forEach((n, idx) => {
      if (saved[n.id]) return; // respeta lo que el usuario ya movió
      // columna más corta
      let c = 0;
      for (let i = 1; i < cols; i++) if (colH[i] < colH[c]) c = i;
      const el = noteRefs.current[n.id];
      const h = el ? el.offsetHeight : 96;
      const xPx = startX + c * (noteW + gap);
      next[n.id] = { fx: xPx / usable, y: colH[c], z: z++, r: TILTS[idx % TILTS.length] };
      colH[c] += h + gap;
    });

    setPositions(next);
    try { localStorage.setItem(posKey, JSON.stringify(next)); } catch {}
    laidOut.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, notes, boardW]);

  const persistPos = useCallback((next) => {
    try { localStorage.setItem(posKey, JSON.stringify(next)); } catch {}
  }, [posKey]);

  const persistArch = (next) => {
    try { localStorage.setItem(archKey, JSON.stringify(next)); } catch {}
  };

  // Altura del contenido para que el board pueda hacer scroll (notas absolutas).
  useEffect(() => {
    let maxBottom = 0;
    notes.forEach((n) => {
      if (archived[n.id]) return;
      const pos = positions[n.id];
      const el = noteRefs.current[n.id];
      if (pos && el) maxBottom = Math.max(maxBottom, pos.y + el.offsetHeight);
    });
    setContentH(maxBottom + 48);
  }, [positions, notes, archived]);

  const bringToFront = (id) => {
    zTop.current += 1;
    setPositions((p) => ({ ...p, [id]: { ...p[id], z: zTop.current } }));
  };

  // --- Drag con pointer capture (mouse + touch) ---
  const onPointerDown = (e, id) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const usable = Math.max(1, boardW - noteW);
    const cur = positions[id] || { fx: 0, y: 0 };
    drag.current = {
      id, startX: e.clientX, startY: e.clientY,
      origXpx: (cur.fx ?? 0) * usable, origY: cur.y ?? 0, usable,
    };
    bringToFront(id);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    let xPx = d.origXpx + (e.clientX - d.startX);
    let y = d.origY + (e.clientY - d.startY);
    xPx = Math.max(0, Math.min(xPx, d.usable)); // siempre dentro del board
    y = Math.max(0, y);
    const fx = xPx / d.usable;
    setPositions((p) => ({ ...p, [d.id]: { ...p[d.id], fx, y } }));
  };

  const onPointerUp = () => {
    if (drag.current) {
      drag.current = null;
      setPositions((p) => { persistPos(p); return p; });
    }
  };

  // --- Rotación con manejador (handle) ---
  const onRotateDown = (e, id) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const el = noteRefs.current[id];
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const cur = positions[id] || {};
    rotate.current = { id, cx, cy, startAngle, origR: cur.r ?? 0 };
    bringToFront(id);
  };

  const onRotateMove = (e) => {
    const r = rotate.current;
    if (!r) return;
    e.stopPropagation();
    const angle = Math.atan2(e.clientY - r.cy, e.clientX - r.cx) * (180 / Math.PI);
    const nextR = r.origR + (angle - r.startAngle);
    setPositions((p) => ({ ...p, [r.id]: { ...p[r.id], r: nextR } }));
  };

  const onRotateUp = (e) => {
    if (rotate.current) {
      e.stopPropagation();
      rotate.current = null;
      setPositions((p) => { persistPos(p); return p; });
    }
  };

  // Persiste el archivado en el servidor para ocultarla también del tendedero.
  const persistHidden = (id, hidden) => {
    fetch(`${API}/dashboard/${dashboardId}/collage/${id}`, {
      method: "PATCH",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ hidden }),
    }).catch(() => {});
  };

  const archiveNote = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const next = { ...archived, [id]: true };
    setArchived(next);
    persistArch(next);
    persistHidden(id, true);
  };

  const restoreNote = (id) => {
    const next = { ...archived };
    delete next[id];
    setArchived(next);
    persistArch(next);
    persistHidden(id, false);
  };

  const visible = notes.filter((n) => !archived[n.id]);
  const archivedNotes = notes.filter((n) => archived[n.id]);

  if (!mounted) return null;

  return createPortal(
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
        <p className="collage-hint">✋ Arrastra y gira las notas a tu gusto · 📸 captura para tu historia</p>
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
          const p = positions[note.id] || { fx: 0, y: 0, z: 10 };
          const rot = p.r ?? TILTS[i % TILTS.length];
          const usable = Math.max(1, boardW - noteW);
          const xPx = Math.min((p.fx ?? 0) * usable, usable); // clamp: nunca fuera
          return (
            <div
              key={note.id}
              ref={(el) => { noteRefs.current[note.id] = el; }}
              className="collage-note"
              onPointerDown={(e) => onPointerDown(e, note.id)}
              style={{
                left: 0, top: 0,
                width: noteW,
                transform: `translate(${xPx}px, ${p.y}px) rotate(${rot}deg)`,
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
              <button
                className="collage-note-rotate"
                onPointerDown={(e) => onRotateDown(e, note.id)}
                onPointerMove={onRotateMove}
                onPointerUp={onRotateUp}
                aria-label="Rotar"
                title="Rotar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            </div>
          );
        })}
        <div className="collage-board-spacer" style={{ height: contentH }} />
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
    </div>,
    document.body
  );
}
