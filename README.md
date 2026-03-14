# MacroChef

Macro-accurate meal planning for nutrition coaches.

## What is this?

MacroChef helps nutrition coaches create, manage, and assign macro-accurate meal plans to their clients. Built on verified USDA nutrition data.

## Tech Stack

- **Next.js 14+** (App Router, TypeScript)
- **PostgreSQL** + **Prisma ORM**
- **Tailwind CSS** + **shadcn/ui**
- **USDA FoodData Central** for nutrition data

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd macrochef

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run database migrations
pnpm prisma migrate dev

# Seed the database (curated ingredients + sample data)
pnpm prisma db seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
macrochef/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (ingredients, sample recipes)
├── src/
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── lib/                   # Utilities (macros, adjustment, db)
│   └── types/                 # TypeScript types
├── docs/                      # Documentation
│   ├── DATABASE_SCHEMA.md     # Schema reference + decisions
│   ├── MVP_SCOPE.md           # What's in/out of MVP
│   └── PRODUCT_SPEC.md        # Full product specification
├── CLAUDE.md                  # AI assistant context file
└── README.md                  # This file
```

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Full project context for AI-assisted development |
| [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Database schema with architecture decisions |
| [docs/MVP_SCOPE.md](./docs/MVP_SCOPE.md) | MVP feature scope (in/out) |
| [docs/PRODUCT_SPEC.md](./docs/PRODUCT_SPEC.md) | Product spec with technical decisions |

## Key Concepts

- **Macros are always computed**, never stored flat on recipes
- **USDA FoodData Central** is the nutrition data source
- **Dominant-macro scaling** adjusts recipes to client targets
- **Weekly meal plans** group daily meal assignments via `meal_plans` container
- **Target profiles** version client macro targets across phases (cut/bulk/maintenance)
- **Lifecycle statuses** on recipes (draft/published/archived), clients (active/archived), meal plans (draft/active/archived)
- **Ingredient overrides** (JSONB) allow per-assignment quantity adjustments
- **8 tables**, reviewed by Claude + ChatGPT + Gemini — ready for development

## License

Private — not open source.
