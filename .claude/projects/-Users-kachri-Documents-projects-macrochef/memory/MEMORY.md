# MacroChef — Session Memory

## Stack
- Next.js 16 (App Router) + TypeScript strict
- Prisma 6 + PostgreSQL
- Tailwind CSS v4 + shadcn/ui (radix-ui, not @radix-ui/*)
- Auth.js v5 (next-auth@beta) — Credentials + JWT strategy
- bcryptjs for password hashing, zod for validation

## Auth Architecture
- `src/lib/auth.config.ts` — **Edge-safe** NextAuth config (no Prisma). Has `authorized` callback + jwt/session callbacks. Used by proxy.ts.
- `src/lib/auth.ts` — Full config (spreads authConfig + adds Credentials provider with Prisma). Exports handlers/signIn/signOut/auth.
- `src/lib/db.ts` — Prisma singleton
- `src/proxy.ts` — Next.js 16 renamed middleware → proxy. Uses edge-safe authConfig. Default export = `NextAuth(authConfig).auth`
- `src/components/providers.tsx` — SessionProvider wrapper (Client Component)
- `src/app/api/auth/[...nextauth]/route.ts` — route handler
- Session strategy: JWT (no extra Prisma adapter tables needed)
- Session includes: user.id, user.role
- ENV required: `AUTH_SECRET` in `.env.local`; `DATABASE_URL` for Prisma
- **CRITICAL**: Must split auth into auth.config.ts (edge-safe) + auth.ts (with Prisma). Prisma crashes in edge runtime.

## Next.js 16 Notes
- `middleware.ts` deprecated → use `proxy.ts` (same API, just filename)
- Prisma client: run `DATABASE_URL=... npx prisma generate` before first use
- `.env.local` is gitignored by default

## User Schema
- `User` model: id (uuid), email (unique), name, passwordHash, role (UserRole enum: coach/client/individual), coachId
- Signup creates `role: "coach"` by default
- No NextAuth adapter tables needed (Credentials + JWT only)

## UI Conventions
- Design: slate/emerald color scheme (emerald-600 accent)
- shadcn components in `src/components/ui/`
- Existing: button.tsx, input.tsx, label.tsx
- Server Actions for mutations (`"use server"`)
- Client Components for interactive forms (useActionState + useFormStatus)

## Key Patterns
- shadcn uses `radix-ui` (not `@radix-ui/react-*` packages)
- Tailwind v4: no tailwind.config.js, uses CSS `@theme inline`
- Prisma seed: `npx tsx prisma/seed.ts`
