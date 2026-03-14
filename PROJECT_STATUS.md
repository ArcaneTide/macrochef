# MacroChef — Project Status

**Last updated:** 2026-03-14
**Current phase:** Sprint 0 — Foundation
**Current step:** Step 5 — Git repo + project scaffold

---

## Progress Tracker

### Sprint 0 — Foundation
- [x] Step 1: Schema design (v3 final — 8 tables, reviewed by 3 AIs)
- [x] Step 2: Documentation pack (7 files: CLAUDE.md, README, schema.prisma, DATABASE_SCHEMA.md, MVP_SCOPE.md, PRODUCT_SPEC.md, ERD HTML)
- [x] Step 3: Figma prototype (full clickable prototype, exported as React/TS code)
- [x] Step 4: Curated ingredient library (126 ingredients, 7 categories, USDA FDC IDs, JSON + XLSX)
- [ ] **Step 5: Git repo + project scaffold** ← CURRENT
- [ ] Step 6: Database up + seed data

### Sprint 1 — Core Engine (weeks 1-2)
- [ ] Step 7: Auth (signup/login)
- [ ] Step 8: Ingredient library API + UI
- [ ] Step 9: Recipe CRUD + real-time macro calculation
- [ ] Step 10: Recipe status workflow (draft → published)

### Sprint 2 — Client & Assignment (weeks 3-4)
- [ ] Step 11: Client CRUD + target profiles
- [ ] Step 12: Meal plan creation (weekly)
- [ ] Step 13: Assign recipe to meal slot (core flow)
- [ ] Step 14: Macro fit score + daily summary

### Sprint 3 — Polish & Launch (weeks 5-6)
- [ ] Step 15: Dashboard
- [ ] Step 16: PDF export
- [ ] Step 17: Responsive mobile
- [ ] Step 18: Bug fixes + coach testing
- [ ] Step 19: Deploy to production

---

## Key Decisions Made

1. **Tech stack:** Next.js 14+ (App Router) + TypeScript + Prisma + PostgreSQL + Tailwind + shadcn/ui
2. **Macros never stored flat** — always computed from ingredients × quantities
3. **USDA FoodData Central** as nutrition data source (bulk imported, not live API)
4. **Dominant-macro scaling** for recipe adjustment (±5% tolerance)
5. **meal_plans container model** with day_index (not absolute dates)
6. **client_target_profiles** for versioned macro targets (cut/bulk/maintenance)
7. **JSONB for ingredient_overrides** — pragmatic MVP choice
8. **Status fields** on recipes (draft/published/archived), clients (active/archived), meal plans (draft/active/archived)
9. **Coach-first MVP** → client portal (Phase 2) → individual users (Phase 3)
10. **No co-founder** — Anastasios building solo with girlfriend contributing code/review informally

---

## Files Inventory

| File | Location | Description |
|------|----------|-------------|
| CLAUDE.md | project root | Master AI context file |
| README.md | project root | Project README |
| schema.prisma | prisma/ | Database schema v3 final |
| DATABASE_SCHEMA.md | docs/ | Schema reference + decisions |
| MVP_SCOPE.md | docs/ | Feature scope (in/out) |
| PRODUCT_SPEC.md | docs/ | Architecture + tech decisions |
| macrochef-erd-v3-final.html | docs/ | Interactive ERD diagram |
| ingredients-seed.json | prisma/ | 126 curated ingredients for seeding |
| macrochef-ingredients.xlsx | docs/ | Ingredient library spreadsheet for review |

---

## How to Continue in a New Chat

If you hit chat limits and need to start a new conversation:

1. Upload these files to the new chat: `CLAUDE.md`, `PROJECT_STATUS.md`, `schema.prisma`
2. Say: "I'm building MacroChef. Here's the project context and current status. We're on Step [X]. Continue from there."
3. Claude will have full context to continue.

For Claude Code / Cursor: `CLAUDE.md` in project root is sufficient.
