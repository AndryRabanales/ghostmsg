// src/api.ts — cliente del backend (mismos endpoints que usa la web)
import { API_URL } from "./config";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  opts: { method?: string; token?: string; body?: unknown } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // respuestas sin cuerpo
  }
  if (!res.ok) {
    throw new ApiError(data?.error || `Error ${res.status}`, res.status);
  }
  return data as T;
}

// ---- Auth ----
export type AuthResponse = {
  token: string;
  publicId: string;
  name: string;
  dashboardId: string;
};

export function loginWithGoogle(idToken: string) {
  return request<AuthResponse>("/auth/google", {
    method: "POST",
    body: { credential: idToken },
  });
}

// ---- Perfil ----
export type Me = {
  name: string;
  publicId: string;
  aliasPrompt?: string | null;
  messagePrompt?: string | null;
  avatarUrl?: string | null;
};

export function getMe(token: string) {
  return request<Me>("/creators/me", { token });
}

export function updateMe(
  token: string,
  body: { name: string; aliasPrompt?: string; messagePrompt?: string; avatarUrl?: string | null }
) {
  return request<Me>("/creators/me", { method: "PATCH", token, body });
}

// ---- Bandeja ----
export type ChatSummary = {
  id: string;
  anonAlias: string;
  isOpened: boolean;
  anonReplied: boolean;
  createdAt: string;
  previewMessage: {
    content: string;
    createdAt: string;
    imageUrl?: string | null;
    mediaType?: string | null;
  } | null;
};

export function getChats(token: string, dashboardId: string, archived: boolean) {
  return request<ChatSummary[]>(
    `/dashboard/${dashboardId}/chats?archived=${archived ? "1" : "0"}`,
    { token }
  );
}

export function openChat(token: string, dashboardId: string, chatId: string) {
  return request<{ ok: boolean }>(
    `/dashboard/${dashboardId}/chats/${chatId}/open`,
    { method: "POST", token }
  );
}

export function archiveChat(
  token: string,
  dashboardId: string,
  chatId: string,
  archived: boolean
) {
  return request<{ success: boolean }>(
    `/dashboard/${dashboardId}/chats/${chatId}/archive`,
    { method: "PATCH", token, body: { archived } }
  );
}

export function deleteChat(token: string, dashboardId: string, chatId: string) {
  return request<{ success: boolean }>(
    `/dashboard/${dashboardId}/chats/${chatId}`,
    { method: "DELETE", token }
  );
}

// ---- Chat (lado creador) ----
export type ChatMessage = {
  id: string;
  from: "anon" | "creator";
  alias?: string;
  content: string;
  createdAt: string;
};

export type ChatDetail = {
  id: string;
  anonToken: string;
  anonAlias: string;
  messages: ChatMessage[];
  expiresAt: string | null;
};

export function getChat(token: string, dashboardId: string, chatId: string) {
  return request<ChatDetail>(`/dashboard/${dashboardId}/chats/${chatId}`, { token });
}

export function sendMessage(
  token: string,
  dashboardId: string,
  chatId: string,
  content: string
) {
  return request<ChatMessage>(
    `/dashboard/${dashboardId}/chats/${chatId}/messages`,
    { method: "POST", token, body: { content } }
  );
}

// ---- Moderación ----
export function reportChat(
  token: string,
  dashboardId: string,
  chatId: string,
  opts: { messageId?: string; reason?: string } = {}
) {
  return request<{ success: boolean }>(
    `/dashboard/${dashboardId}/chats/${chatId}/report`,
    { method: "POST", token, body: opts }
  );
}

export function blockChat(
  token: string,
  dashboardId: string,
  chatId: string,
  blocked: boolean
) {
  return request<{ success: boolean }>(
    `/dashboard/${dashboardId}/chats/${chatId}/block`,
    { method: "PATCH", token, body: { blocked } }
  );
}

// ---- Push ----
export function registerPushToken(token: string, pushToken: string, platform: string) {
  return request<{ success: boolean }>(`/creators/me/push-token`, {
    method: "POST",
    token,
    body: { token: pushToken, platform },
  });
}
