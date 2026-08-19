"use client";

/* ============================================================
 * Saved listings / favorites (Feature 6). Client-side store,
 * persisted to localStorage. Phase 6 can promote this to a
 * per-user server-backed list; the useSaved() hook stays.
 * ============================================================ */

import * as React from "react";

interface SavedState {
  ids: string[];
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
}

const KEY = "rd.saved";
const SavedContext = React.createContext<SavedState | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = React.useState<string[]>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Intentional one-time client hydration from localStorage on mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const toggle = React.useCallback(
    (id: string) => {
      setIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const value = React.useMemo<SavedState>(
    () => ({
      ids,
      ready,
      has: (id: string) => ids.includes(id),
      toggle,
      count: ids.length,
    }),
    [ids, ready, toggle],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedState {
  const ctx = React.useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
