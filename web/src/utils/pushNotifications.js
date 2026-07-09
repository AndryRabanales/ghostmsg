// src/utils/pushNotifications.js
const API = process.env.NEXT_PUBLIC_API || "https://api.ghostmsg.space";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// iOS (iPhone/iPad) — incluye iPadOS que se hace pasar por Mac con touch.
export function isIos() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// ¿La página está abierta como app instalada (pantalla de inicio)?
export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export async function subscribeToPush(anonToken, chatId) {
  if (!isPushSupported()) {
    throw new Error("Tu navegador no soporta notificaciones.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones denegado.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const keyRes = await fetch(`${API}/push/vapid-public-key`);
  if (!keyRes.ok) throw new Error("Notificaciones no disponibles ahora mismo.");
  const { publicKey } = await keyRes.json();

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const res = await fetch(`${API}/${anonToken}/${chatId}/push-subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
  if (!res.ok) throw new Error("No se pudo guardar la suscripción.");

  return true;
}
