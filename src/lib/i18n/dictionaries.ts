/* Lightweight i18n scaffold (Feature 23). English is the source; Filipino
 * shows the mechanism working. Strings are added incrementally — any missing
 * key falls back to English, then to the key itself. */

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fil", label: "Filipino" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

export const dictionaries: Record<LangCode, Dict> = {
  en: {
    "nav.home": "Home",
    "nav.findHome": "Find a property",
    "nav.track": "Track application",
    "nav.help": "Help",
    "nav.signIn": "Sign in",
    "nav.saved": "Saved homes",
    "nav.account": "My account",
    "cta.findHome": "Find a property",
    "footer.language": "Language",
  },
  fil: {
    "nav.home": "Home",
    "nav.findHome": "Maghanap ng ari-arian",
    "nav.track": "Subaybayan",
    "nav.help": "Tulong",
    "nav.signIn": "Mag-sign in",
    "nav.saved": "Mga naka-save",
    "nav.account": "Aking account",
    "cta.findHome": "Maghanap ng ari-arian",
    "footer.language": "Wika",
  },
};
