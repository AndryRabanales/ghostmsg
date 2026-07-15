// src/components/GoogleLoginButton.jsx
"use client";
import { useEffect, useRef } from "react";
import Script from "next/script";

const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleLoginButton({ onSuccess, onError, endpoint = "/auth/google", text = "continue_with" }) {
  const buttonRef = useRef(null);

  const handleCredential = async (response) => {
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión con Google");
      onSuccess(data);
    } catch (err) {
      onError?.(err.message);
    }
  };

  const renderButton = () => {
    if (!window.google || !buttonRef.current || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "filled_black",
      shape: "pill",
      size: "large",
      width: 290,
      text,
      logo_alignment: "left",
    });
  };

  useEffect(() => {
    if (window.google) renderButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="google-login-frame">
      <span className="google-login-label">Continúa con</span>
      <div className="google-login-wrapper">
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={renderButton}
        />
        <div ref={buttonRef} />
      </div>
    </div>
  );
}
