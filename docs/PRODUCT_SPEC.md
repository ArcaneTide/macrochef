# MacroChef — Product Specification

## 1. Product Vision

MacroChef is the go-to precision tool for macro-based meal planning — built on verified nutrition data, not guesswork. Starting coach-first, expanding to client portals and individual users.

## 2. Target Users

### Phase 1 (MVP)
- Online nutrition coaches
- Personal trainers managing client nutrition
- Fitness coaches

### Phase 2
- Clients of coaches (view-only portal)

### Phase 3
- Individual users (self-managed meal planning)

## 3. Market Positioning

Performance nutrition tool for physique improvement, fat loss, muscle gain. NOT a generic wellness/diet app. Differentiation: macro accuracy from verified USDA data, built for the coaching workflow.

Target markets: English-speaking, primarily UK/Europe, online coaching audiences.

## 4. Architecture Decisions

### 4.1 Nutrition-First Architecture
The system is built around ingredient-level nutrition data. Hierarchy:
```
Ingredient data → Nutrition values → Recipe composition → Macro calculations → Recipe adjustment → Meal plans
```

### 4.2 USDA FoodData Central as Source of Truth
- Primary nutrition database: https://fdc.nal.usda.gov/
- Data is bulk-imported into local `ingredients` table (not live API calls)
- Curated subset of 500-800 commonly used ingredients
- AI never generates macro values

### 4.3 Computed Macros (Never Stored Flat)
- Recipe macros are always calculated from ingredients × quantities
- No `total_calories` column on recipes — always derived
- Prevents stale data when ingredients or quantities change

### 4.4 Dominant-Macro Scaling for Adjustment
- Ingredients categorized as primarily protein/carb/fat/vegetable/other
- When adjusting recipe to client targets, scale each category by its macro ratio
- Accept ±5% tolerance
- Coach can fine-tune individual ingredients
- Full optimization (linear programming) is post-MVP if needed

### 4.5 Weekly Plans via Container Model
- `meal_plans` table groups assignments
- `meal_assignments` use `day_index` (0-6) not absolute dates
- Actual date = plan.start_date + day_index
- Enables variable-length plans, copying, templates

### 4.6 Target Profile Versioning
- Macro targets are NOT on the client record
- Separate `client_target_profiles` table
- Enables cut/bulk/maintenance phase tracking
- Full history preserved
- One active profile per client (app-enforced)

### 4.7 JSONB for Ingredient Overrides
- `meal_assignments.ingredient_overrides` is JSONB
- Stores adjusted quantities: `{ "ingredientId": grams }`
- Pragmatic for MVP — avoids extra join table
- Queryable in Postgres
- Can migrate to relational model if needed for smart swaps

### 4.8 Role-Based Access (Simple Enum)
- `users.role` enum: coach / client / individual
- Sufficient for MVP through Phase 3
- Can evolve to permissions/membership model if team features needed

## 5. Data Model Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| users | Identity + auth | email, role, coach_id |
| ingredients | USDA nutrition data | name, usda_fdc_id, category, macros per 100g |
| recipes | Coach-created meals | title, servings, status (draft/published/archived) |
| recipe_ingredients | Quantities | recipe_id, ingredient_id, quantity_grams |
| clients | Coach's client profiles | name, status (active/archived) |
| client_target_profiles | Versioned macro targets | calorie/protein/carbs/fat targets, is_active, label |
| meal_plans | Weekly plan container | client_id, start/end date, status (draft/active/archived) |
| meal_assignments | Day + slot assignments | meal_plan_id, day_index, meal_slot, servings, overrides |

## 6. Key User Flows

### Create Recipe
Coach → Recipe Library → New Recipe → Add ingredients (search curated library) → Set quantities → See real-time macro calculation → Set status to published → Save

### Create Client + Targets
Coach → Client List → New Client → Enter name/email → Create target profile (calories, protein, carbs, fat) → Save

### Assign Meal
Coach → Client Detail → Select day tab → Click empty meal slot → Search published recipes → Select recipe → See macro budget remaining → Adjust servings or individual ingredients → See fit score → Confirm

### Weekly Plan
Coach → Client Detail → Create New Plan (set week dates) → Fill in meals day by day → Review daily macro totals → Activate plan

## 7. Technical Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ORM | Prisma | Fast development, type safety, good migration tooling |
| Frontend | Next.js App Router | Server Components for performance, Server Actions for mutations |
| CSS | Tailwind + shadcn/ui | Matches Figma prototype aesthetic, rapid development |
| Auth | TBD | NextAuth.js or Clerk — decide before development |
| Database | PostgreSQL | Relational integrity, JSONB support, scalable |
| Hosting | TBD | Vercel (frontend) + Supabase/Railway (Postgres) |
| Ingredient data | Bulk import | USDA API is slow/unreliable — cache locally, sync periodically |
| Macro storage | Computed always | Never denormalize until performance requires it |
| Overrides | JSONB | Pragmatic MVP choice, migratable later |
| Meal plan model | Container + day_index | Flexible length, copyable, template-ready |

## 8. Schema Review History

Schema has been reviewed by three independent AI systems:
- **Claude (Anthropic):** Primary architect. Designed the schema.
- **ChatGPT (OpenAI):** Suggested ClientTargetProfile (adopted), scaling_role (deferred), snapshotting (deferred).
- **Gemini (Google):** Validated approach. Suggested scoped ingredients (backlogged), soft deletes (deferred), unit field (handled in UI).

All three confirmed: schema is solid for MVP, no structural problems found.
