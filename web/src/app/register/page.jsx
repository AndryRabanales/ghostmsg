// src/app/register/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  return (
    <div className="auth-container">
      <main className="auth-card">
        <h1>Crear Cuenta</h1>
        <p className="auth-subtitle">Regístrate con tu cuenta de Google en un clic.</p>
        <GoogleLoginButton
          onSuccess={(data) => {
            localStorage.clear();
            localStorage.setItem("token", data.token);
            localStorage.setItem("publicId", data.publicId);
            router.push(`/dashboard/${data.dashboardId}`);
          }}
          onError={setError}
        />
        {error && <p className="auth-error">{error}</p>}
        <p className="auth-footer-link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </main>
    </div>
  );
}
