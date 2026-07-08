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
        <h1 style={{
          fontSize: '34px',
          fontWeight: '800',
          letterSpacing: '-2.5px',
          background: 'linear-gradient(90deg, #8e2de2, #c9a4ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 15px',
          textAlign: 'center'
        }}>
          Iniciar sesión
        </h1>
        <p style={{
          color: 'rgba(235, 235, 245, 0.6)',
          fontSize: '18px',
          margin: '0 auto 30px',
          lineHeight: '1.7',
          maxWidth: '350px',
          textAlign: 'center'
        }}>
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
