// src/app/eliminar-cuenta/page.jsx
// Autoservicio de eliminación de cuenta (requerido por Play Store / App Store).
"use client";
import { useState } from "react";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function EliminarCuenta() {
  const [status, setStatus] = useState("idle"); // idle | confirming | done | error
  const [message, setMessage] = useState("");

  return (
    <div className="auth-container">
      <main className="auth-card">
        <div className="auth-mark">👻</div>
        <h1>Eliminar mi cuenta</h1>
        <p className="auth-subtitle">
          Esto elimina de forma permanente tu cuenta de <b>GhostMsg</b>, tu
          perfil, y todos los chats y mensajes asociados a ella. Los mensajes
          anónimos que enviaste desde otros dispositivos (sin cuenta) no se ven
          afectados.
        </p>

        {status === "idle" && (
          <>
            <p className="auth-subtitle" style={{ fontSize: 13, opacity: 0.8 }}>
              Para verificar que eres el dueño de la cuenta, inicia sesión con el
              mismo Google que usas en GhostMsg. La eliminación es inmediata y no
              se puede deshacer.
            </p>
            <GoogleLoginButton
              endpoint="/account/delete-with-google"
              text="signin_with"
              onSuccess={(data) => {
                setStatus("done");
                setMessage(data.message || "Tu cuenta fue eliminada.");
              }}
              onError={(err) => {
                setStatus("error");
                setMessage(err || "No se pudo verificar tu cuenta.");
              }}
            />
          </>
        )}

        {status === "done" && (
          <div className="success-panel">
            <h3>✅ Listo</h3>
            <p>{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="form-status-message error">
            <p>{message}</p>
            <button className="edit-profile-photo-btn" onClick={() => setStatus("idle")}>
              Reintentar
            </button>
          </div>
        )}

        <p className="auth-footer-link" style={{ marginTop: 24 }}>
          ¿Prefieres escribirnos? <b>rabanalesandry2@gmail.com</b>
        </p>
      </main>
    </div>
  );
}
