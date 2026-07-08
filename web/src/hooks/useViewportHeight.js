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

    const setHeight = () => {
      root.style.setProperty("--app-height", `${window.innerHeight}px`);
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
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setHeight);
    }

    return () => {
      window.removeEventListener("resize", setHeight);
      window.removeEventListener("orientationchange", setHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setHeight);
      }
      root.style.overflow = prev.rootOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
    };
  }, []);
}
