// src/hooks/useViewportHeight.js
"use client";
import { useEffect } from "react";

/**
 * Full-screen mobile chat sizing, done the reliable way:
 *
 * 1. Measures the REAL visible height (window.innerHeight) and writes it to a
 *    CSS variable (--app-height). iOS Safari computes 100vh/100dvh/inset:0
 *    relative to its dynamic toolbars inconsistently, so we don't trust them.
 * 2. Locks the document scroll while the chat is mounted. The body is taller
 *    than the visible area (min-height:100vh = the LARGE viewport on iOS), so
 *    without this the page scrolls behind the fixed chat and iOS drifts the
 *    "fixed" header/footer out of place. Locking overflow removes that class
 *    of bug entirely.
 */
export function useViewportHeight() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const vv = window.visualViewport;

    // Usamos el visualViewport: en iOS, al abrir el teclado, window.innerHeight
    // NO cambia, pero visualViewport.height sí baja al área visible. Así el chat
    // se encoge justo sobre el teclado (header + mensajes + input a la vista),
    // en vez de dejar el input tapado y que iOS empuje todo hacia arriba.
    const setHeight = () => {
      const h = vv ? vv.height : window.innerHeight;
      const top = vv ? vv.offsetTop : 0;
      root.style.setProperty("--app-height", `${h}px`);
      root.style.setProperty("--app-top", `${top}px`);
    };
    setHeight();

    const prev = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
    };
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "100%";

    window.addEventListener("resize", setHeight);
    window.addEventListener("orientationchange", setHeight);
    if (vv) {
      vv.addEventListener("resize", setHeight);
      vv.addEventListener("scroll", setHeight); // offsetTop cambia al desplazarse
    }

    return () => {
      window.removeEventListener("resize", setHeight);
      window.removeEventListener("orientationchange", setHeight);
      if (vv) {
        vv.removeEventListener("resize", setHeight);
        vv.removeEventListener("scroll", setHeight);
      }
      root.style.overflow = prev.rootOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
    };
  }, []);
}
