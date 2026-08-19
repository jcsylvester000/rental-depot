export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const nonEmpty = (v?: string) => !!v && v.trim().length > 0;
export const isNumberLike = (v?: string) => !!v && /^\d[\d,]*$/.test(v.trim());

/** Strip commas/spaces and parse to a number (major units). */
export const toNumber = (v?: string): number => Number((v ?? "").replace(/[^\d.]/g, "")) || 0;
