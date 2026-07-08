// src/hooks/useViewportHeight.js
"use client";
import { useEffect } from "react";

/**
 * Writes the REAL visible viewport height into a CSS variable (--app-height).
 * iOS Safari computes 100vh/100dvh/inset:0 inconsistently (they include the
 * area behind the toolbars), which breaks full-screen layouts. Measuring
 * window.innerHeight in JS is the reliable, battle-tested source of truth.
 */
export function useViewportHeight() {
  useEffect(() => {
    const setHeight = () => {
      const h = window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${h}px`);
    };

    setHeight();
    window.addEventListener("resize", setHeight);
    window.addEventListener("orientationchange", setHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setHeight);
    }

    return () => {
      window.removeEventListener("resize", setHeight);
      window.removeEventListener("orientationchange", setHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setHeight);
      }
    };
  }, []);
}
