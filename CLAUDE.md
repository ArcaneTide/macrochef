# CLAUDE.md — MacroChef Project Context

## What is MacroChef

MacroChef is a SaaS platform for nutrition coaches to create macro-accurate meal plans for their clients. It is built around verified USDA nutrition data — macros are always calculated from ingredient-level data, never estimated or AI-generated.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router) + TypeScript
- **Backend:** Next.js API routes / Server Actions
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS + shadcn/ui components
- **Auth:** TBD (likely NextAuth.js or Clerk)
- **Deployment:** TBD (likely Vercel + Supabase or Railway for Postgres)

## Architecture Principles

1. **Macros are never stored at recipe level.** Always computed on-the-fly from `recipe_ingredients` → `ingredients`. This eliminates stale data.
2. **Ingredients are the source of truth.** Every nutrition value traces back to a USDA FoodData Central entry.
3. **AI never generates macro values.** AI may assist in recipe ideation (post-MVP), but macros always come from verified ingredient data.
4. **Coach-first product.** The MVP serves coaches only. Client portal and individual users come in later phases.

## Product Phases

- **Phase 1 (MVP):** Coach creates recipes, manages clients with target profiles, assigns macro-adjusted meals in weekly plans. Export to PDF.
- **Phase 2:** Client portal — clients log in and view their assigned meal plans.
- **Phase 3:** Individual users — self-managed users who build their own meal plans.

## Database Schema

See `prisma/schema.prisma` for the full schema. Key tables:

- `users` — role-based identity (coach / client / individual)
- `ingredients` — USDA-verified, curated library (~500-800 items)
- `recipes` — coach-created, with status (draft/published/archived)
- `recipe_ingredients` — join table with quantities in grams
- `clients` — coach's client profiles with status
- `client_target_profiles` — versioned macro targets (cut/bulk/maintenance)
- `meal_plans` — weekly plan containers with status (draft/active/archived)
- `meal_assignments` — day + slot + recipe + optional ingredient overrides (JSONB)

### Key Schema Rules

- Quantities in `recipe_ingredients` are for TOTAL servings. Per-serving = quantity ÷ recipe.servings.
- `ingredient_overrides` in meal_assignments is JSONB: `{ "ingredientId": gramsQuantity }`. If null, use recipe defaults × servings.
- `client_target_profiles.is_active` — only one should be true per client. Enforce in application layer via transaction.
- Only `published` recipes appear in the assign-to-client flow.

## Macro Calculation

```
ingredient_macros = (quantity_grams / 100) × macro_per_100g
recipe_macros_per_serving = Σ(ingredient_macros) / recipe.servings
assignment_macros = recipe_macros_per_serving × assignment.servings
  (OR use ingredient_overrides if present)
daily_macros = Σ(assignment_macros for all slots on a given day)
```

## Adjustment Algorithm (Dominant-Macro Scaling)

When assigning a recipe to a client, the system can suggest adjusted quantities:

1. Group ingredients by `category` (protein / carb / fat / vegetable / other)
2. Calculate scaling ratio per macro: `target / recipe_value`
3. Scale protein-category ingredients by protein_ratio
4. Scale carb-category ingredients by carb_ratio
5. Scale fat-category ingredients by fat_ratio
6. Keep vegetables and seasonings unchanged
7. Recalculate and show fit score
8. Accept ±5% tolerance. Coach can fine-tune individual ingredients.

## Macro Fit Score

```
deviation = |actual - target| / target  (per macro)
fit_score = max(0, round((1 - mean(deviations)) × 100))
```

Color coding: green (≤5% off), amber (≤10%), red (>10%).

## File Structure (Target)

```
macrochef/
├── prisma/
│   └── schema.prisma
│   └── seed.ts              # Seed curated ingredients + sample data
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/           # Login, signup
│   │   ├── dashboard/
│   │   ├── recipes/
│   │   ├── clients/
│   │   └── api/              # API routes if needed
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Feature components
│   ├── lib/
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── macros.ts         # Macro calculation functions
│   │   ├── adjustment.ts     # Dominant-macro scaling algorithm
│   │   └── auth.ts           # Auth utilities
│   └── types/
│       └── index.ts          # Shared TypeScript types
├── docs/
│   ├── DATABASE_SCHEMA.md
│   ├── MVP_SCOPE.md
│   └── PRODUCT_SPEC.md
├── CLAUDE.md                 # This file
├── README.md
└── package.json
```

## Coding Conventions

- Use TypeScript strict mode
- Use Prisma for all database access (no raw SQL unless performance-critical)
- Server Components by default, Client Components only when needed (interactivity)
- Use Server Actions for mutations where possible
- All macro calculations must go through `lib/macros.ts` — never inline math
- snake_case in database (via Prisma @map), camelCase in TypeScript
- Use Zod for input validation on API routes / Server Actions

## What NOT to Build (MVP)

- AI recipe generation
- Recipe import from URL
- Automated smart swaps
- Training day / rest day toggle
- Consumer/client portal (Phase 2)
- Shopping list generation
- Onboarding wizard
- Payment / billing
