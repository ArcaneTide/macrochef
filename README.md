# MacroChef

Macro-accurate meal planning for nutrition coaches.

## What is this?

MacroChef helps nutrition coaches create, manage, and assign macro-accurate meal plans to their clients. All macro values are computed from verified USDA ingredient data — nothing is estimated or AI-generated.

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **PostgreSQL** + **Prisma ORM**
- **NextAuth v5** (credentials-based auth, JWT sessions)
- **Tailwind CSS v4** + **shadcn/ui**
- **@react-pdf/renderer** for PDF export

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ running locally (or a remote connection string)

## Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd macrochef
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and AUTH_SECRET
# Generate AUTH_SECRET with: npx auth secret

# 3. Create the database (if running locally)
createdb macrochef

# 4. Run migrations
npx prisma migrate deploy

# 5. Seed the ingredient library (126 USDA-verified ingredients)
npx prisma db seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up at `/signup` to create your coach account.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth signing secret — generate with `npx auth secret` |

See `.env.example` for format.

## Project Structure

```
macrochef/
├── prisma/
│   ├── schema.prisma          # 8-table PostgreSQL schema
│   ├── seed.ts                # Ingredient library seeder
│   └── ingredients-seed.json  # 126 USDA ingredients
├── src/
│   ├── app/                   # Next.js App Router pages + API routes
│   │   ├── (auth)/            # Login, signup
│   │   ├── (dashboard)/       # Protected coach UI
│   │   └── api/               # PDF export endpoint
│   ├── components/            # React components
│   ├── lib/                   # Core utilities (macros, db, auth, pdf)
│   └── proxy.ts               # Auth middleware (Next.js 16 convention)
├── docs/
│   ├── DATABASE_SCHEMA.md
│   ├── MVP_SCOPE.md
│   ├── PRODUCT_SPEC.md
│   └── TECH_DECISIONS.md
└── CLAUDE.md                  # AI assistant context
```

## Key Concepts

- **Macros are always computed** from `recipe_ingredients` → `ingredients`. Never stored on the recipe itself.
- **USDA FoodData Central** is the nutrition source of truth.
- **Lifecycle statuses** on recipes (`draft` / `published` / `archived`), clients (`active` / `archived`), and meal plans (`draft` / `active` / `archived`).
- **Versioned target profiles** track a client's macro targets across phases (cut / bulk / maintenance).
- **Fit score** (0–100) measures how closely a meal assignment matches a client's targets.

## Scripts

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run lint      # ESLint check
npx prisma studio # Open Prisma database browser
npx prisma migrate dev --name <name>  # Create and apply a new migration
```

## Documentation

| Document | Description |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | Full project context for AI-assisted development |
| [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Schema reference with architecture decisions |
| [docs/MVP_SCOPE.md](./docs/MVP_SCOPE.md) | MVP feature scope (in/out) |
| [docs/PRODUCT_SPEC.md](./docs/PRODUCT_SPEC.md) | Full product specification |
| [docs/TECH_DECISIONS.md](./docs/TECH_DECISIONS.md) | Why each technology was chosen |

## License

Private — not open source.
