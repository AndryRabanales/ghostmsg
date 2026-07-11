// src/session.tsx — sesión del creador guardada en SecureStore.
// El token NO expira (igual que la web): solo se borra con "Cerrar sesión".
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

const KEY = "ghostmsg_session_v1";

export type Session = {
  token: string;
  dashboardId: string;
  publicId: string;
  name: string;
};

type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  signIn: (s: Session) => Promise<void>;
  signOut: () => Promise<void>;
  update: (patch: Partial<Session>) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEY);
        if (raw) setSession(JSON.parse(raw));
      } catch {
        // sesión corrupta: se ignora y el usuario inicia sesión de nuevo
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (s: Session) => {
    setSession(s);
    await SecureStore.setItemAsync(KEY, JSON.stringify(s));
  }, []);

  const signOut = useCallback(async () => {
    setSession(null);
    await SecureStore.deleteItemAsync(KEY);
  }, []);

  const update = useCallback(async (patch: Partial<Session>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ session, loading, signIn, signOut, update }),
    [session, loading, signIn, signOut, update]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
