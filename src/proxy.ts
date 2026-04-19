import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use the edge-safe config (no Prisma) so this can run in the edge runtime.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login, /signup (auth pages)
     * - /api/auth (NextAuth routes)
     * - /_next/static, /_next/image (Next.js internals)
     * - /favicon.ico and other static root files
     */
    "/((?!login|signup|forgot-password|reset-password|privacy|terms|api/auth|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).+)",
  ],
};
