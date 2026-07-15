// src/app/eliminar-datos/page.jsx
// Autoservicio para borrar los datos (chats y mensajes) SIN eliminar la cuenta.
"use client";
import { useState } from "react";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function EliminarDatos() {
  const [status, setStatus] = useState("idle"); // idle | done | error
  const [message, setMessage] = useState("");

  return (
    <div className="auth-container">
      <main className="auth-card">
        <div className="auth-mark">👻</div>
        <h1>Eliminar mis datos</h1>
        <p className="auth-subtitle">
          Esto elimina de forma permanente <b>todos tus chats y mensajes</b> en{" "}
          <b>GhostMsg</b>, pero <b>tu cuenta sigue activa</b> (conservas tu perfil
          y tu link para seguir recibiendo mensajes). Si en cambio quieres borrar
          también tu cuenta, usa la página <b>/eliminar-cuenta</b>.
        </p>

        {status === "idle" && (
          <>
            <p className="auth-subtitle" style={{ fontSize: 13, opacity: 0.8 }}>
              Para verificar que eres el dueño de la cuenta, inicia sesión con el
              mismo Google que usas en GhostMsg. El borrado es inmediato y no se
              puede deshacer. Los chats también se borran automáticamente 24 horas
              después de crearse.
            </p>
            <GoogleLoginButton
              endpoint="/account/delete-data-with-google"
              text="signin_with"
              onSuccess={(data) => {
                setStatus("done");
                setMessage(data.message || "Tus datos fueron eliminados.");
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
