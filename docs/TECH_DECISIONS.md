# Technology Decisions

Why each technology in MacroChef was chosen, and what alternatives were considered.

---

## PostgreSQL

MacroChef has genuinely relational data: coaches own clients, clients have versioned target profiles, recipes have ingredients, meal plans have assignments. These relationships map naturally to tables with foreign keys, which PostgreSQL handles well. PostgreSQL also supports `JSONB` columns natively — used for `ingredient_overrides` on meal assignments, where we need a flexible key-value map without creating a separate table. The alternative was SQLite (simpler local setup, no server needed), but SQLite lacks JSONB and isn't suitable for a multi-user hosted product.

## Prisma

Prisma generates TypeScript types directly from the schema, so database shapes and application code are always in sync — no manual type maintenance. It handles migrations, query building, and relation loading. The main alternative was Drizzle ORM, which is more lightweight and closer to raw SQL. Prisma was chosen because it's more mature, has better ecosystem support, and the generated client is easier to read for a team that isn't deep in SQL.

## Next.js

Next.js gives a single codebase for both the React UI and the server-side logic. Server Components fetch data directly from the database without a separate API layer, Server Actions handle form mutations, and API routes cover the PDF export endpoint. This keeps the architecture simple — no separate Express/Fastify backend, no REST API to maintain. The alternative was a separate frontend (Vite + React) and backend (Express). That split was rejected because it doubles the deployment complexity and adds a network boundary for every data fetch.

## NextAuth.js (v5)

Authentication is a solved problem and should not be hand-rolled. NextAuth handles session management, JWT signing, CSRF protection, and the credential verification flow. It also has first-class support for the Next.js App Router and edge middleware. The alternative was Clerk (hosted auth service), which would have been faster to set up but introduces a third-party dependency for a core security feature and adds per-user pricing. For a coaching SaaS where we control the user model, owning auth is the right call.

## Tailwind CSS

Utility-first CSS scales well in a component-heavy React app — styles live next to the markup, there's no CSS file to maintain, and unused styles are purged at build time. Combined with shadcn/ui (unstyled Radix primitives styled with Tailwind), the component library is fully owned and customisable rather than locked to a design system. The alternative was CSS Modules or styled-components. Both work, but they require more context-switching and make it harder to enforce consistency across components.
