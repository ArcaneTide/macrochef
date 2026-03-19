export type Lang = "en" | "el";

const dict = {
  // ── Nav ──────────────────────────────────────────────────
  "Dashboard":               { en: "Dashboard",               el: "Πίνακας Ελέγχου" },
  "Recipes":                 { en: "Recipes",                 el: "Συνταγές" },
  "Clients":                 { en: "Clients",                 el: "Πελάτες" },
  "Ingredients":             { en: "Ingredients",             el: "Υλικά" },
  "Settings":                { en: "Settings",                el: "Ρυθμίσεις" },
  "Sign out":                { en: "Sign out",                el: "Αποσύνδεση" },

  // ── Buttons ───────────────────────────────────────────────
  "New Recipe":              { en: "New Recipe",              el: "Νέα Συνταγή" },
  "New Client":              { en: "New Client",              el: "Νέος Πελάτης" },
  "Save Draft":              { en: "Save Draft",              el: "Αποθήκευση" },
  "Publish":                 { en: "Publish",                 el: "Δημοσίευση" },
  "Cancel":                  { en: "Cancel",                  el: "Ακύρωση" },
  "Delete":                  { en: "Delete",                  el: "Διαγραφή" },
  "Download PDF":            { en: "Download PDF",            el: "Λήψη PDF" },

  // ── Form labels ───────────────────────────────────────────
  "Search":                  { en: "Search...",               el: "Αναζήτηση..." },
  "Servings":                { en: "Servings",                el: "Μερίδες" },
  "Calories":                { en: "Calories",                el: "Θερμίδες" },
  "Protein":                 { en: "Protein",                 el: "Πρωτεΐνη" },
  "Carbs":                   { en: "Carbs",                   el: "Υδατάνθρακες" },
  "Fat":                     { en: "Fat",                     el: "Λίπος" },
  "Title":                   { en: "Title",                   el: "Τίτλος" },
  "Cuisine":                 { en: "Cuisine",                 el: "Κουζίνα" },
  "Meal Type":               { en: "Meal Type",               el: "Τύπος Γεύματος" },
  "Instructions":            { en: "Instructions",            el: "Οδηγίες" },
  "Per Serving":             { en: "Per Serving",             el: "Ανά Μερίδα" },

  // ── Status labels ─────────────────────────────────────────
  "Active":                  { en: "Active",                  el: "Ενεργός" },
  "Archived":                { en: "Archived",                el: "Αρχειοθετημένο" },
  "Draft":                   { en: "Draft",                   el: "Πρόχειρο" },
  "Published":               { en: "Published",               el: "Δημοσιευμένο" },

  // ── Meal types ────────────────────────────────────────────
  "Breakfast":               { en: "Breakfast",               el: "Πρωινό" },
  "Lunch":                   { en: "Lunch",                   el: "Μεσημεριανό" },
  "Dinner":                  { en: "Dinner",                  el: "Δείπνο" },
  "Snack":                   { en: "Snack",                   el: "Σνακ" },

  // ── Section titles ────────────────────────────────────────
  "Meal Plans":              { en: "Meal Plans",              el: "Πλάνα Γευμάτων" },
  "Ingredient Library":      { en: "Ingredient Library",      el: "Βιβλιοθήκη Υλικών" },
  "Active Clients":          { en: "Active Clients",          el: "Ενεργοί Πελάτες" },
  "Published Recipes":       { en: "Published Recipes",       el: "Δημοσιευμένες Συνταγές" },
  "Active Meal Plans":       { en: "Active Meal Plans",       el: "Ενεργά Πλάνα Γευμάτων" },
  "Recent Activity":         { en: "Recent Activity",         el: "Πρόσφατη Δραστηριότητα" },

  // ── Dashboard greetings ───────────────────────────────────
  "Welcome":                 { en: "Welcome",                 el: "Καλώς ήρθες" },
  "Welcome back":            { en: "Welcome back",            el: "Καλώς ήρθες ξανά" },

  // ── Welcome / onboarding ──────────────────────────────────
  "Welcome to MacroChef":        { en: "Welcome to MacroChef!",              el: "Καλώς ήρθες στο MacroChef!" },
  "Get started in three steps":  { en: "Get started in three steps.",         el: "Ξεκίνα με τρία βήματα." },
  "Create your first recipe":    { en: "Create your first recipe",            el: "Δημιούργησε την πρώτη σου συνταγή" },
  "Add a client":                { en: "Add a client with macro targets",      el: "Πρόσθεσε πελάτη με στόχους" },
  "Build a weekly meal plan":    { en: "Build a weekly meal plan",            el: "Φτιάξε εβδομαδιαίο πλάνο γευμάτων" },

  // ── Empty states ──────────────────────────────────────────
  "No recipes yet":          { en: "No recipes yet",          el: "Δεν υπάρχουν συνταγές" },
  "No clients yet":          { en: "No clients yet",          el: "Δεν υπάρχουν πελάτες" },

  // ── Auth ──────────────────────────────────────────────────
  "Forgot password":         { en: "Forgot password?",        el: "Ξέχασα τον κωδικό" },
  "Reset password":          { en: "Reset password",          el: "Επαναφορά κωδικού" },
} as const;

export type TranslationKey = keyof typeof dict;

export function t(key: TranslationKey, lang: Lang): string {
  return dict[key][lang];
}
