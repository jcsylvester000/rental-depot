/* ============================================================
 * RENTAL DEPOT — Typed API client
 * ------------------------------------------------------------
 * Used by client components (browser) and, later, the mobile app
 * (which can reuse this module or replicate its contract). Server
 * components read through the DataStore directly (no HTTP hop);
 * everything else goes through these typed calls.
 * ============================================================ */

import type { ApiResponse } from "@/lib/api/response";
import type { Unit, UnitSummary } from "@/lib/types";

/** Same-origin in the browser; set NEXT_PUBLIC_API_BASE_URL for cross-origin (mobile). */
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = (await res.json()) as ApiResponse<T>;
  if (!body.ok) {
    throw new ApiClientError(body.error.code, body.error.message, res.status);
  }
  return body.data;
}

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export const api = {
  health: () => apiGet<{ service: string; version: string; status: string }>("/health"),
  listUnits: (query?: string) => apiGet<UnitSummary[]>(`/units${query ? `?${query}` : ""}`),
  getUnit: (id: string) => apiGet<Unit>(`/units/${id}`),
};
