// src/utils/formatMessageTime.js

/**
 * Formats a message timestamp for display in the chat.
 * - Today:      "14:32"
 * - This year:  "8 jul, 14:32"
 * - Older:      "8 jul 2025, 14:32"
 */
export function formatMessageTime(createdAt) {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return time;

  const sameYear = d.getFullYear() === now.getFullYear();
  const date = d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return `${date}, ${time}`;
}
