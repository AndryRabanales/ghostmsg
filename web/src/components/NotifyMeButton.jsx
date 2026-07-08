// src/components/NotifyMeButton.jsx
"use client";
import { useEffect, useState } from "react";
import { isPushSupported, subscribeToPush } from "@/utils/pushNotifications";

export default function NotifyMeButton({ anonToken, chatId }) {
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | loading | subscribed | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setSupported(isPushSupported());
    if (isPushSupported() && Notification.permission === "granted") {
      // Ya tenía permiso concedido de una visita anterior; re-registra en silencio.
      subscribeToPush(anonToken, chatId).then(() => setStatus("subscribed")).catch(() => {});
    }
  }, [anonToken, chatId]);

  if (!supported || status === "subscribed") return supported && status === "subscribed" ? (
    <div className="notify-me-chip is-subscribed">
      🔔 Te avisaremos cuando responda
    </div>
  ) : null;

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
