# MacroChef — MVP Scope

## Target Timeline
6 weeks from development start.

## User
One user type in MVP: **Coach**. No client login, no individual users.

## Core Features

### 1. Authentication
- Email + password signup/login
- Single coach account
- Session management

### 2. Recipe Management
- Create recipe: title, servings, instructions, cuisine, meal type
- Add ingredients from curated library (search + select)
- Set quantity in grams per ingredient
- Auto-calculate macros per serving (real-time)
- Edit existing recipes
- Delete recipes
- Recipe status: draft → published → archived
- Recipe library view with search, filter by cuisine/meal type, sort

### 3. Ingredient Library
- Pre-seeded curated library (500-800 USDA-verified ingredients)
- Search by name
- View nutrition per 100g (calories, protein, carbs, fat)
- Read-only for coaches (verified data, not editable)
- Each ingredient has a category (protein/carb/fat/vegetable/fruit/dairy/seasoning/other)

### 4. Client Management
- Create client: name, email (optional)
- Set macro targets via target profile (calories, protein, carbs, fat)
- Edit client info and targets
- Archive clients (soft delete via status)
- Client list with search
- Client detail page

### 5. Target Profiles
- Each client has one or more target profiles
- Profile has: label (optional), calorie target, protein/carbs/fat targets
- Only one active profile at a time
- Coach can create new profile (e.g. switching from cut to maintenance)
- Previous profiles kept as history

### 6. Meal Plan Management
- Create weekly meal plan for a client (start date, end date, title)
- Meal plan status: draft → active → archived
- View plan as daily breakdown (day tabs or day navigation)
- Each day has 5 meal slots: breakfast, lunch, dinner, snack 1, snack 2

### 7. Recipe Assignment (Core Flow)
- Coach selects a meal slot on a specific day
- Searches/selects a recipe from published recipes
- Sees: recipe macros, remaining macro budget for that slot, macro fit score
- Can adjust servings
- Can manually adjust individual ingredient quantities (overrides)
- Confirms assignment
- Daily macro summary: total assigned vs client targets with progress bars
- Color coding: green (≤5% off), amber (≤10%), red (>10%)

### 8. Export
- Export meal plan to PDF (basic format)

### 9. Dashboard
- Summary: total clients, total recipes, active meal plans
- Quick actions: new recipe, new client
- Recent activity feed
- Client overview with meal plan progress

## NOT in MVP
- AI recipe generation
- Recipe import from URL
- Automated ingredient substitution (smart swaps)
- Training day / rest day plans
- Client portal / client login
- Individual user mode
- Shopping list
- Payment / subscription / billing
- Mobile app (responsive web only)
- Onboarding wizard
- Recipe sharing / marketplace
- Notifications
