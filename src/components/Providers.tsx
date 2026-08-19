"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { SavedProvider } from "@/lib/client/saved";
import { ToastProvider } from "@/lib/client/toast";
import { LanguageProvider } from "@/lib/i18n/context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <SavedProvider>
          <ToastProvider>{children}</ToastProvider>
        </SavedProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
