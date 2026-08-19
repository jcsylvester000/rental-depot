"use client";

import * as React from "react";

interface ToastItem {
  id: number;
  message: string;
}
interface ToastState {
  toast: (message: string) => void;
}

const ToastContext = React.createContext<ToastState | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const seq = React.useRef(0);

  const toast = React.useCallback((message: string) => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-host" aria-live="polite" aria-atomic="true">
        {items.map((t) => (
          <div key={t.id} className="toast">
            <span className="dot" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
