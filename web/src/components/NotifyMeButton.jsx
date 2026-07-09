// src/components/NotifyMeButton.jsx
"use client";
import { useEffect, useState } from "react";
import { isPushSupported, subscribeToPush, isIos, isStandalone } from "@/utils/pushNotifications";

export default function NotifyMeButton({ anonToken, chatId }) {
  const [mode, setMode] = useState("hidden"); // hidden | button | ios-hint
  const [status, setStatus] = useState("idle"); // idle | loading | subscribed | error
  const [errorMsg, setErrorMsg] = useState("");
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isPushSupported()) {
      setMode("button");
      if (Notification.permission === "granted") {
        subscribeToPush(anonToken, chatId).then(() => setStatus("subscribed")).catch(() => {});
      }
    } else if (isIos() && !isStandalone()) {
      // iOS solo permite push si la página está en la pantalla de inicio.
      setMode("ios-hint");
    } else {
      setMode("hidden");
    }
  }, [anonToken, chatId]);

  const handleClick = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await subscribeToPush(anonToken, chatId);
      setStatus("subscribed");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  if (mode === "hidden") return null;

  if (status === "subscribed") {
    return (
      <div className="notify-me-wrap">
        <div className="notify-me-chip is-subscribed">🔔 Te avisaremos cuando responda</div>
      </div>
    );
  }

  if (mode === "ios-hint") {
    return (
      <div className="notify-me-wrap">
        <button type="button" className="notify-me-chip" onClick={() => setShowIosHelp((v) => !v)}>
          🔔 Recibir avisos de respuesta
        </button>
        {showIosHelp && (
          <div className="notify-me-ios-help">
            En iPhone, toca <strong>Compartir</strong> <span aria-hidden>􀈂</span> y luego{" "}
            <strong>“Agregar a inicio”</strong>. Abre GhostMsg desde el ícono y podrás activar los avisos.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="notify-me-wrap">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="notify-me-chip"
      >
        {status === "loading" ? "Activando..." : "🔔 Avísame cuando responda"}
      </button>
      {status === "error" && <div className="notify-me-error">{errorMsg}</div>}
    </div>
  );
}
