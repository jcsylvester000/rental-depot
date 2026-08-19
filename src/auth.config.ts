import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types";

const OPERATOR_ROLES = ["agent", "manager", "admin"];

/**
 * Edge-safe base config (no Prisma, no bcrypt). Used by middleware for
 * route protection. The Credentials provider with the DB lookup is added
 * only in auth.ts (Node runtime).
 */
export const authConfig = {
  pages: { signIn: "/account/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role as UserRole;
      return session;
    },
    authorized({ auth, request }) {
      const role = auth?.user?.role as UserRole | undefined;
      const path = request.nextUrl.pathname;
      const isOperator = !!role && OPERATOR_ROLES.includes(role);

      // Operator API — return a JSON 401 (not an HTML redirect) for clients.
      if (path.startsWith("/api/v1/admin")) {
        if (isOperator) return true;
        return NextResponse.json(
          { ok: false, error: { code: "forbidden", message: "Operator access required" } },
          { status: 401 },
        );
      }
      if (path.startsWith("/admin")) return isOperator;
      if (
        path.startsWith("/account/profile") ||
        path.startsWith("/account/documents") ||
        path.startsWith("/account/saved")
      ) {
        return !!auth;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
