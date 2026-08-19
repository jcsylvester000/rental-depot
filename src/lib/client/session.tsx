"use client";

/* ============================================================
 * Mock session (Phase 1). Client-side only, persisted to
 * localStorage, so the applicant UI (sign in, profile, "my
 * applications") works before real auth exists. Replaced by
 * Auth.js + server sessions in Phase 6 — components consume the
 * useSession() hook, so the swap is contained.
 * ============================================================ */

import * as React from "react";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
}

interface SessionState {
  user: SessionUser | null;
  ready: boolean;
  login: (email: string, fullName?: string) => void;
  logout: () => void;
  update: (patch: Partial<SessionUser>) => void;
}

const KEY = "rd.session";
const SessionContext = React.createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Intentional one-time client hydration from localStorage on mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persist = React.useCallback((u: SessionUser | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const login = React.useCallback(
    (email: string, fullName?: string) => {
      const name = fullName?.trim() || email.split("@")[0];
      persist({ id: "appl_local", fullName: name, email });
    },
    [persist],
  );

  const logout = React.useCallback(() => persist(null), [persist]);

  const update = React.useCallback(
    (patch: Partial<SessionUser>) => {
      persist(user ? { ...user, ...patch } : user);
    },
    [persist, user],
  );

  const value = React.useMemo(
    () => ({ user, ready, login, logout, update }),
    [user, ready, login, logout, update],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
