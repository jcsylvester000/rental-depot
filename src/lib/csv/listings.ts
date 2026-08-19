/* ============================================================
 * Shared CSV contract for bulk listing upload.
 * Used by BOTH the operator admin importer and the public
 * owner-facing submission page, and by the template download —
 * one column order, one validator, everywhere.
 * ============================================================ */

import type { BulkListingRow } from "@/lib/data/store";
import { UNIT_TYPES, AMENITIES, PROPERTY_CLASSES } from "@/lib/types";

/** Canonical column order. The template and the parser both use this. */
export const LISTING_CSV_COLUMNS = [
  "property_name",
  "city",
  "region",
  "code",
  "title",
  "property_class",
  "type",
  "permitted_use",
  "bedrooms",
  "bathrooms",
  "area_sqm",
  "rent_php",
  "deposit_php",
  "pets_allowed",
  "income_multiple",
  "available_from",
  "amenities",
  "description",
] as const;

/** A ready-to-fill template: header + two worked example rows (one residential, one commercial). */
export const LISTING_CSV_TEMPLATE = [
  LISTING_CSV_COLUMNS.join(","),
  [
    "Katipunan Garden Residences", "Quezon City", "Metro Manila", "GRD-4901",
    "Sunny 1-bedroom near transit", "residential", "1br", "", "1", "1", "38",
    "24000", "48000", "true", "3", "2026-10-01",
    "parking;aircon;security", "Bright one-bedroom a short walk from the station.",
  ].map(csvEscape).join(","),
  [
    "Makati Skyline Lofts", "Makati", "Metro Manila", "SKY-C03",
    "Corner retail unit, ground floor", "commercial", "retail", "Retail / F&B", "0", "1", "70",
    "75000", "225000", "false", "3", "2026-11-01",
    "parking;aircon;security", "High-visibility corner retail space with wide frontage.",
  ].map(csvEscape).join(","),
].join("\n") + "\n";

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Split one CSV line into fields, honouring double-quoted fields with embedded commas. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const BOOL_TRUE = new Set(["true", "yes", "y", "1"]);
const BOOL_FALSE = new Set(["false", "no", "n", "0", ""]);

export interface ParseResult {
  rows: BulkListingRow[];
  errors: { row: number; message: string }[];
}

/** Parse + validate CSV text into BulkListingRow[]. Row numbers are 1-based data rows (excluding the header). */
export function parseListingsCsv(text: string): ParseResult {
  const rows: BulkListingRow[] = [];
  const errors: { row: number; message: string }[] = [];

  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { rows, errors: [{ row: 0, message: "The file is empty." }] };

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const missing = LISTING_CSV_COLUMNS.filter((c) => idx(c) === -1);
  if (missing.length) {
    return { rows, errors: [{ row: 0, message: `Missing required column(s): ${missing.join(", ")}. Download the template to see the exact format.` }] };
  }

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const get = (name: string) => (cells[idx(name)] ?? "").trim();
    const rowNo = i;
    const rowErr = (message: string) => errors.push({ row: rowNo, message });

    const code = get("code");
    const title = get("title");
    if (!code) { rowErr("`code` is required."); continue; }
    if (!title) { rowErr(`Row for ${code}: \`title\` is required.`); continue; }
    if (!get("property_name")) { rowErr(`${code}: \`property_name\` is required.`); continue; }

    const propertyClass = (get("property_class") || "residential").toLowerCase();
    if (!(PROPERTY_CLASSES as readonly string[]).includes(propertyClass)) {
      rowErr(`${code}: \`property_class\` must be one of ${PROPERTY_CLASSES.join(" / ")}.`); continue;
    }
    const type = get("type").toLowerCase();
    if (!(UNIT_TYPES as readonly string[]).includes(type)) {
      rowErr(`${code}: \`type\` "${type}" is not valid (use ${UNIT_TYPES.join(", ")}).`); continue;
    }

    const num = (name: string, def = NaN) => {
      const raw = get(name).replace(/[,₱\s]/g, "");
      if (raw === "") return def;
      const n = Number(raw);
      return Number.isFinite(n) ? n : NaN;
    };
    const bedrooms = num("bedrooms", 0);
    const bathrooms = num("bathrooms", 1);
    const areaSqm = num("area_sqm", 0);
    const rentPhp = num("rent_php");
    const depositPhp = num("deposit_php", rentPhp * 2);
    const incomeMultiple = num("income_multiple", 3);
    if (!Number.isFinite(rentPhp) || rentPhp <= 0) { rowErr(`${code}: \`rent_php\` must be a positive number.`); continue; }
    if ([bedrooms, bathrooms, areaSqm, incomeMultiple].some((n) => !Number.isFinite(n))) {
      rowErr(`${code}: bedrooms/bathrooms/area_sqm/income_multiple must be numbers.`); continue;
    }

    const petsRaw = get("pets_allowed").toLowerCase();
    if (!BOOL_TRUE.has(petsRaw) && !BOOL_FALSE.has(petsRaw)) { rowErr(`${code}: \`pets_allowed\` must be true or false.`); continue; }
    const petsAllowed = BOOL_TRUE.has(petsRaw);

    const availRaw = get("available_from");
    let availableFrom: string;
    if (!availRaw) availableFrom = new Date().toISOString();
    else {
      const d = new Date(availRaw);
      if (isNaN(d.getTime())) { rowErr(`${code}: \`available_from\` "${availRaw}" is not a valid date (use YYYY-MM-DD).`); continue; }
      availableFrom = d.toISOString();
    }

    const amenities = get("amenities")
      .split(/[;|]/)
      .map((a) => a.trim().toLowerCase())
      .filter((a): a is (typeof AMENITIES)[number] => (AMENITIES as readonly string[]).includes(a));

    rows.push({
      propertyName: get("property_name"),
      city: get("city") || undefined,
      region: get("region") || undefined,
      code,
      title,
      propertyClass: propertyClass as "residential" | "commercial",
      type,
      permittedUse: get("permitted_use") || undefined,
      bedrooms, bathrooms, areaSqm,
      rentMinor: Math.round(rentPhp * 100),
      depositMinor: Math.round((Number.isFinite(depositPhp) ? depositPhp : rentPhp * 2) * 100),
      petsAllowed,
      incomeMultiple,
      availableFrom,
      amenities,
      description: get("description"),
    });
  }

  return { rows, errors };
}
