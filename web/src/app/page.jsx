// src/app/page.jsx (Versión fusionada: Intro + Login)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  return (
    <div className="auth-container">
      <main className="auth-card">
        <div className="auth-mark">👻</div>
        <h1>Iniciar sesión</h1>
        <p className="auth-subtitle">
          Crea tu espacio anónimo, compártelo y descubre lo que otros realmente piensan.
        </p>

        <GoogleLoginButton
          onSuccess={(data) => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("publicId", data.publicId);
            router.push(`/dashboard/${data.dashboardId}`);
          }}
          onError={setError}
        />
        {error && <p className="auth-error">{error}</p>}
      </main>
    </div>
  );
}
