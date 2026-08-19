/* ============================================================
 * RENTAL DEPOT — API response envelope
 * A single, versioned response shape for every /api/v1 endpoint,
 * so the web client and the future mobile client parse responses
 * identically.
 * ============================================================ */

import { NextResponse } from "next/server";

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, meta?: ApiMeta, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data, meta }, init);
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json<ApiFailure>(
    { ok: false, error: { code, message, details } },
    { status },
  );
}

export const notFound = (message = "Resource not found") =>
  fail("not_found", message, 404);

export const badRequest = (message = "Invalid request", details?: unknown) =>
  fail("bad_request", message, 400, details);

export const serverError = (message = "Something went wrong") =>
  fail("server_error", message, 500);
