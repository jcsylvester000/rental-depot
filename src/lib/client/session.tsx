"use client";

/* ============================================================
 * Session hook — now backed by real Auth.js sessions (Phase 6b).
 * Keeps the same shape the app already consumes, so components
 * that call useSession() did not change when auth became real.
 * ============================================================ */

import { useSession as useNextAuthSession, signOut } from "next-auth/react";
import type { UserRole } from "@/lib/types";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

interface SessionState {
  user: SessionUser | null;
  ready: boolean;
  isOperator: boolean;
  logout: () => void;
}

const OPERATOR_ROLES: UserRole[] = ["agent", "manager", "admin"];

export function useSession(): SessionState {
  const { data, status } = useNextAuthSession();
  const u = data?.user;
  const user: SessionUser | null = u
    ? { id: u.id, fullName: u.name ?? u.email ?? "", email: u.email ?? "", role: u.role }
    : null;
  return {
    user,
    ready: status !== "loading",
    isOperator: !!user && OPERATOR_ROLES.includes(user.role),
    logout: () => signOut({ redirectTo: "/" }),
  };
}
