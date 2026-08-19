"use client";

import * as React from "react";
import { SessionProvider } from "@/lib/client/session";
import { SavedProvider } from "@/lib/client/saved";
import { ToastProvider } from "@/lib/client/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SavedProvider>
        <ToastProvider>{children}</ToastProvider>
      </SavedProvider>
    </SessionProvider>
  );
}
