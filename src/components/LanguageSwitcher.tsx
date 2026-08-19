"use client";

import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <div>
      <h5>{t("footer.language")}</h5>
      <div style={{ display: "flex", gap: 6 }}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className="chip-toggle"
            aria-pressed={lang === l.code}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
