"use client";

import * as React from "react";
import { dictionaries, type LangCode } from "@/lib/i18n/dictionaries";

interface I18nState {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
}

const KEY = "rd.lang";
const I18nContext = React.createContext<I18nState | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<LangCode>("en");

  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const saved = localStorage.getItem(KEY) as LangCode | null;
      if (saved && dictionaries[saved]) setLangState(saved);
    } catch {
      /* ignore */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setLang = React.useCallback((l: LangCode) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = React.useCallback(
    (key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key,
    [lang],
  );

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nState {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
