# MacroChef — Database Schema Reference (v3)

## Overview

This document describes the PostgreSQL database schema for MacroChef. 8 tables. The schema supports three product phases without structural changes between phases.

**Phase 1 (MVP):** Coach creates recipes, manages clients with versioned target profiles, assigns macro-adjusted meals in weekly plans.
**Phase 2:** Client portal — clients log in and view their assigned meal plans.
**Phase 3:** Individual users — self-managed users who build their own meal plans.

**Review history:** Schema reviewed by Claude (Anthropic), ChatGPT (OpenAI), and Gemini (Google). All confirmed it as solid for MVP with no structural problems.

---

## Architecture Principles

**Macros are never stored at recipe level.** They are always computed on-the-fly from ingredient data × quantities. This eliminates stale data bugs.

**Ingredients are the source of truth.** Every nutrition value traces back to a USDA FoodData Central entry. AI never generates macro values.

**Macro targets are versioned.** Client targets live in a separate `client_target_profiles` table, not on the client record. This enables cut/bulk/maintenance phases with full history.

**Weekly plans are containers.** `meal_plans` groups `meal_assignments`. Assignments use `day_index` (0-6) instead of absolute dates, enabling variable-length plans, copying, and templates.

**Every core entity has a lifecycle status.** Recipes (draft/published/archived), clients (active/archived), meal plans (draft/active/archived).

**Clients exist independently of user accounts.** A coach can create a client profile without the client signing up. The `user_id` on clients is nullable — populated only if/when the client creates an account (Phase 2).

---

## Tables

### users

The central identity table. Every person who logs in has a row here.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| email | string | Unique |
| name | string | Display name |
| password_hash | string | Hashed password |
| role | enum | `coach`, `client`, `individual` |
| coach_id | uuid (nullable) | FK → users. Set for client-role users to link them to their coach |
| created_at | timestamp | |
| updated_at | timestamp | |

**Index:** coach_id

**MVP usage:** Only coach accounts exist. Client and individual roles are defined but unused until Phase 2/3.

---

### ingredients

Curated ingredient library with verified USDA nutrition data.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | string | Unique, human-readable name |
| usda_fdc_id | string (nullable) | USDA FoodData Central ID for traceability |
| category | enum | `protein`, `carb`, `fat`, `vegetable`, `fruit`, `dairy`, `seasoning`, `other` |
| calories_per_100g | float | |
| protein_per_100g | float | |
| carbs_per_100g | float | |
| fat_per_100g | float | |
| fiber_per_100g | float (nullable) | |
| is_verified | boolean | True if mapped to USDA entry |
| created_at | timestamp | |

**Index:** usda_fdc_id

**Key design decision:** The `category` field drives the adjustment algorithm. Protein-category ingredients scale by protein ratio, carb-category by carb ratio, etc.

**MVP target:** 500-800 curated ingredients, all with `is_verified = true`.

---

### recipes

Coach-created (or individual-created) recipes.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK → users. The coach or individual who owns this recipe |
| title | string | |
| servings | int | Default 2. All ingredient quantities are for total servings |
| instructions | text (nullable) | |
| cuisine | string (nullable) | Mediterranean, Asian, etc. |
| meal_type | enum (nullable) | `breakfast`, `lunch`, `dinner`, `snack` |
| status | enum | `draft`, `published`, `archived`. Default: draft |
| is_template | boolean | If true, recipe is available as a shared template |
| created_at | timestamp | |
| updated_at | timestamp | |

**Index:** user_id

**Important:** Recipes do NOT store macro totals. Macros are always calculated from recipe_ingredients. Only `published` recipes appear in the assign-to-client flow.

---

### recipe_ingredients

Join table linking recipes to ingredients with quantities.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| recipe_id | uuid | FK → recipes (cascade delete) |
| ingredient_id | uuid | FK → ingredients |
| quantity_grams | float | Total grams for ALL servings of the recipe |
| sort_order | int | Display order in the recipe |

**Unique constraint:** (recipe_id, ingredient_id) — an ingredient can only appear once per recipe.

**Indexes:** recipe_id, ingredient_id

**Macro calculation:** `ingredient_macros = (quantity_grams / 100) × macro_per_100g`. Per serving: divide by recipe.servings.

---

### clients

Client profiles managed by coaches. Macro targets have been moved to `client_target_profiles`.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| coach_id | uuid | FK → users. The coach who manages this client |
| user_id | uuid (nullable, unique) | FK → users. Populated when client creates account (Phase 2) |
| name | string | |
| email | string (nullable) | Informational, not used for auth |
| status | enum | `active`, `archived`. Default: active |
| notes | text (nullable) | Coach notes about the client |
| created_at | timestamp | |
| updated_at | timestamp | |

**Index:** coach_id

**Phase 2 upgrade path:** When a client signs up, a user row is created with `role = client`, and client.user_id is populated. No schema change needed.

---

### client_target_profiles

Versioned macro targets per client. Enables cut/bulk/maintenance phase tracking with full history.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| client_id | uuid | FK → clients (cascade delete) |
| label | string (nullable) | e.g. "Cut phase", "Maintenance", "Training day" |
| calorie_target | int | Daily kcal |
| protein_target | float | Daily grams |
| carbs_target | float | Daily grams |
| fat_target | float | Daily grams |
| is_active | boolean | Only one should be true per client. Default: true |
| created_at | timestamp | |

**Index:** client_id

**Application rule:** When activating a new profile, deactivate all others for the same client in a transaction. This ensures only one active profile at any time. Enforced in application layer, not database constraint.

**Why this exists:** Targets change over time (cut → maintenance → bulk). Storing them on the client record loses history. This model preserves every past target set.

---

### meal_plans

Container for a set of meal assignments. Groups daily meals into a coherent plan (typically 7 days).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| client_id | uuid | FK → clients (cascade delete) |
| title | string (nullable) | e.g. "Week 12 — Cut phase" |
| status | enum | `draft`, `active`, `archived`. Default: draft |
| start_date | date | First day of the plan |
| end_date | date | Last day of the plan |
| notes | text (nullable) | Coach notes for this period |
| created_at | timestamp | |
| updated_at | timestamp | |

**Index:** client_id

**Why this exists:** Without a plan container, assignments are loose rows queried by date range — fragile for variable-length plans. This enables: copy plan, plan history, weekly view, plan templates.

---

### meal_assignments

The core output: which recipe goes to which day and meal slot within a plan.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| meal_plan_id | uuid | FK → meal_plans (cascade delete) |
| recipe_id | uuid | FK → recipes |
| day_index | int | 0 = first day of plan, 1 = second, ..., 6 = seventh |
| meal_slot | enum | `breakfast`, `lunch`, `dinner`, `snack1`, `snack2` |
| servings | float | Default 1. Can be 0.5, 1.5, etc. |
| ingredient_overrides | jsonb (nullable) | Adjusted quantities: `{ "ingredientId": grams }` |
| created_at | timestamp | |

**Unique constraint:** (meal_plan_id, day_index, meal_slot) — one recipe per slot per day per plan.

**Index:** meal_plan_id

**Actual date calculation:** `plan.start_date + day_index`

**Macro calculation with overrides:**
- If `ingredient_overrides` is null: use recipe quantities × (servings / recipe.servings)
- If `ingredient_overrides` is set: use override quantities directly

**Why JSONB:** Pragmatic for MVP. Avoids extra join table (MealAssignmentIngredient) which would create N rows per assignment. JSONB is queryable in Postgres and migratable to relational model later if needed for smart swaps.

---

## Macro Fit Score

The fit score measures how closely a meal's macros match the remaining budget for a slot:

```
deviation_per_macro = |actual - target| / target
average_deviation = mean(deviation_calories, deviation_protein, deviation_carbs, deviation_fat)
fit_score = max(0, round((1 - average_deviation) * 100))
```

Color coding: green (≤5% off), amber (≤10% off), red (>10% off).

---

## Adjustment Algorithm (Dominant-Macro Scaling)

When assigning a recipe to a client, the system suggests adjusted ingredient quantities:

1. Group ingredients by `category` (protein / carb / fat / vegetable / other)
2. Calculate the scaling ratio per macro: `target_protein / recipe_protein`
3. Scale protein-category ingredients by protein_ratio
4. Scale carb-category ingredients by carb_ratio
5. Scale fat-category ingredients by fat_ratio
6. Keep vegetables and seasonings unchanged (or scale minimally)
7. Recalculate total macros and compute fit score
8. Accept ±5% tolerance. Coach can fine-tune individual ingredients.

This is a heuristic, not exact optimization. Works well for most real-world recipes.

---

## Enums

| Enum | Values | Used In |
|------|--------|---------|
| UserRole | coach, client, individual | users.role |
| MealSlot | breakfast, lunch, dinner, snack1, snack2 | meal_assignments.meal_slot |
| IngredientCategory | protein, carb, fat, vegetable, fruit, dairy, seasoning, other | ingredients.category |
| MealType | breakfast, lunch, dinner, snack | recipes.meal_type |
| RecipeStatus | draft, published, archived | recipes.status |
| MealPlanStatus | draft, active, archived | meal_plans.status |
| ClientStatus | active, archived | clients.status |

---

## Indexes Summary

| Table | Indexed Columns | Type |
|-------|----------------|------|
| users | email | unique |
| users | coach_id | index |
| ingredients | name | unique |
| ingredients | usda_fdc_id | index |
| recipes | user_id | index |
| recipe_ingredients | (recipe_id, ingredient_id) | unique |
| recipe_ingredients | recipe_id | index |
| recipe_ingredients | ingredient_id | index |
| clients | coach_id | index |
| client_target_profiles | client_id | index |
| meal_plans | client_id | index |
| meal_assignments | (meal_plan_id, day_index, meal_slot) | unique |
| meal_assignments | meal_plan_id | index |

---

## Phase Roadmap

| Phase | What | Schema Changes |
|-------|------|----------------|
| Phase 1 (MVP) | Coach workflow: recipes, clients, target profiles, weekly meal plans | None — schema is ready |
| Phase 2 | Client portal: clients log in, view meals | Populate `clients.user_id`, create user rows with `role = client` |
| Phase 3 | Individual users: self-managed meal planning | Create user rows with `role = individual`, auto-create self-client record |

---

## Deferred Architectural Decisions

These were discussed during schema review and intentionally deferred:

| Topic | Decision | Revisit When |
|-------|----------|--------------|
| Recipe snapshotting | Not needed — coach has few recipes, knows what changes | If recipe edits cause unexpected changes in old plans |
| Ingredient scaling_role per recipe | Use ingredient.category as default | If coaches need per-recipe override of scaling behavior |
| Scoped ingredients (coach-owned) | All ingredients are global (curated library) | If coaches request custom ingredients |
| Soft deletes (deletedAt) | Use status fields (archived) instead | If hard deletes cause data loss issues |
| Relational overrides (MealAssignmentIngredient) | JSONB is sufficient | If smart swaps feature needs queryable override history |
| RBAC / permissions model | Simple role enum | If team/organization features are needed |
