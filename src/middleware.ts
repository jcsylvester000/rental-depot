import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: uses the base config (no Prisma). The `authorized` callback
// enforces operator-only /admin and authenticated account subpages.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/v1/admin/:path*",
    "/account/profile/:path*",
    "/account/documents/:path*",
    "/account/saved/:path*",
  ],
};
