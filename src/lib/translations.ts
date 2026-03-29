export type Lang = "en" | "el";

const dict = {
  // ── Nav ──────────────────────────────────────────────────
  "Dashboard":               { en: "Dashboard",               el: "Πίνακας Ελέγχου" },
  "Recipes":                 { en: "Recipes",                 el: "Συνταγές" },
  "Clients":                 { en: "Clients",                 el: "Πελάτες" },
  "Ingredients":             { en: "Ingredients",             el: "Υλικά" },
  "Settings":                { en: "Settings",                el: "Ρυθμίσεις" },
  "Sign out":                { en: "Sign out",                el: "Αποσύνδεση" },
  "Home":                    { en: "Home",                    el: "Αρχική" },

  // ── Buttons ───────────────────────────────────────────────
  "New Recipe":              { en: "New Recipe",              el: "Νέα Συνταγή" },
  "New Client":              { en: "New Client",              el: "Νέος Πελάτης" },
  "Save Draft":              { en: "Save Draft",              el: "Αποθήκευση" },
  "Publish":                 { en: "Publish",                 el: "Δημοσίευση" },
  "Cancel":                  { en: "Cancel",                  el: "Ακύρωση" },
  "Delete":                  { en: "Delete",                  el: "Διαγραφή" },
  "Download PDF":            { en: "Download PDF",            el: "Λήψη PDF" },
  "Save":                    { en: "Save",                    el: "Αποθήκευση" },
  "Edit":                    { en: "Edit",                    el: "Επεξεργασία" },
  "Archive":                 { en: "Archive",                 el: "Αρχειοθέτηση" },
  "Activate":                { en: "Activate",                el: "Ενεργοποίηση" },
  "Restore":                 { en: "Restore",                 el: "Επαναφορά" },
  "Assign":                  { en: "Assign",                  el: "Ανάθεση" },
  "Try again":               { en: "Try again",               el: "Δοκίμασε ξανά" },
  "Go to Dashboard":         { en: "Go to Dashboard",         el: "Μετάβαση στον Πίνακα" },

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
  "Name":                    { en: "Name",                    el: "Όνομα" },
  "Email":                   { en: "Email",                   el: "Email" },
  "Password":                { en: "Password",                el: "Κωδικός" },
  "Full name":               { en: "Full name",               el: "Ονοματεπώνυμο" },
  "Notes":                   { en: "Notes",                   el: "Σημειώσεις" },
  "Profile Label":           { en: "Profile Label",           el: "Ετικέτα Προφίλ" },
  "Plan Title":              { en: "Plan Title",              el: "Τίτλος Πλάνου" },
  "Start Date":              { en: "Start Date",              el: "Ημ/νία Έναρξης" },
  "Category":                { en: "Category",                el: "Κατηγορία" },
  "Status":                  { en: "Status",                  el: "Κατάσταση" },
  "New password":            { en: "New password",            el: "Νέος κωδικός" },
  "Confirm new password":    { en: "Confirm new password",    el: "Επιβεβαίωση κωδικού" },

  // ── Status labels ─────────────────────────────────────────
  "Active":                  { en: "Active",                  el: "Ενεργό" },
  "Archived":                { en: "Archived",                el: "Αρχειοθετημένο" },
  "Draft":                   { en: "Draft",                   el: "Πρόχειρο" },
  "Published":               { en: "Published",               el: "Δημοσιευμένο" },

  // ── Meal types ────────────────────────────────────────────
  "Breakfast":               { en: "Breakfast",               el: "Πρωινό" },
  "Lunch":                   { en: "Lunch",                   el: "Μεσημεριανό" },
  "Dinner":                  { en: "Dinner",                  el: "Δείπνο" },
  "Snack":                   { en: "Snack",                   el: "Σνακ" },
  "Snack 1":                 { en: "Snack 1",                 el: "Σνακ 1" },
  "Snack 2":                 { en: "Snack 2",                 el: "Σνακ 2" },

  // ── Section titles ────────────────────────────────────────
  "Meal Plans":              { en: "Meal Plans",              el: "Πλάνα Γευμάτων" },
  "Ingredient Library":      { en: "Ingredient Library",      el: "Βιβλιοθήκη Υλικών" },
  "Active Clients":          { en: "Active Clients",          el: "Ενεργοί Πελάτες" },
  "Published Recipes":       { en: "Published Recipes",       el: "Δημοσιευμένες Συνταγές" },
  "Active Meal Plans":       { en: "Active Meal Plans",       el: "Ενεργά Πλάνα Γευμάτων" },
  "Recent Activity":         { en: "Recent Activity",         el: "Πρόσφατη Δραστηριότητα" },
  "Recipe Details":          { en: "Recipe Details",          el: "Στοιχεία Συνταγής" },
  "Client Info":             { en: "Client Info",             el: "Στοιχεία Πελάτη" },
  "Initial Macro Targets":   { en: "Initial Macro Targets",   el: "Αρχικοί Μακροστόχοι" },
  "Active Macro Targets":    { en: "Active Macro Targets",    el: "Ενεργοί Μακροστόχοι" },
  "Profile History":         { en: "Profile History",         el: "Ιστορικό Προφίλ" },
  "Edit Client":             { en: "Edit Client",             el: "Επεξεργασία Πελάτη" },
  "New Profile":             { en: "New Profile",             el: "Νέο Προφίλ" },
  "New Plan":                { en: "New Plan",                el: "Νέο Πλάνο" },
  "New Meal Plan":           { en: "New Meal Plan",           el: "Νέο Πλάνο Γευμάτων" },
  "Daily Total":             { en: "Daily Total",             el: "Ημερήσιο Σύνολο" },
  "Fit score":               { en: "Fit score",               el: "Βαθμός Συμβ." },
  "Fit score help":          { en: "How closely this matches the daily macro target", el: "Πόσο ταιριάζει με τον ημερήσιο στόχο" },
  "Assign Recipe":           { en: "Assign Recipe",           el: "Ανάθεση Συνταγής" },

  // ── Dashboard greetings ───────────────────────────────────
  "Welcome":                 { en: "Welcome",                 el: "Καλώς ήρθες" },
  "Welcome back":            { en: "Welcome back",            el: "Καλώς ήρθες ξανά" },
  "Good morning":            { en: "Good morning",            el: "Καλημέρα" },
  "Good afternoon":          { en: "Good afternoon",          el: "Καλησπέρα" },
  "Good evening":            { en: "Good evening",            el: "Καλό βράδυ" },
  "Good night":              { en: "Good night",              el: "Καληνύχτα" },

  // ── Welcome / onboarding ──────────────────────────────────
  "Welcome to MacroPie":        { en: "Welcome to MacroPie!",              el: "Καλώς ήρθες στο MacroPie!" },
  "Get started in three steps":  { en: "Get started in three steps.",         el: "Ξεκίνα με τρία βήματα." },
  "Create your first recipe":    { en: "Create your first recipe",            el: "Δημιούργησε την πρώτη σου συνταγή" },
  "Add a client":                { en: "Add a client with macro targets",      el: "Πρόσθεσε πελάτη με στόχους" },
  "Build a weekly meal plan":    { en: "Build a weekly meal plan",            el: "Φτιάξε εβδομαδιαίο πλάνο γευμάτων" },

  // ── Empty states / messages ───────────────────────────────
  "No recipes yet":          { en: "No recipes yet.",         el: "Δεν υπάρχουν συνταγές." },
  "No clients yet":          { en: "No clients yet.",         el: "Δεν υπάρχουν πελάτες." },
  "No recipes match filters":{ en: "No recipes match your filters.", el: "Δεν ταιριάζουν συνταγές με τα φίλτρα." },
  "No clients match search": { en: "No clients match your filters.", el: "Δεν βρέθηκαν πελάτες." },
  "No ingredients found":    { en: "No ingredients found.",   el: "Δεν βρέθηκαν υλικά." },
  "No recipes found":        { en: "No recipes found.",       el: "Δεν βρέθηκαν συνταγές." },
  "No active profile":       { en: "No active profile. Create one above.", el: "Δεν υπάρχει ενεργό προφίλ." },
  "No meal plans yet":       { en: "No meal plans yet.",      el: "Δεν υπάρχουν πλάνα γευμάτων." },
  "No active clients yet":   { en: "No active clients yet.",  el: "Δεν υπάρχουν ενεργοί πελάτες." },
  "Nothing yet":             { en: "Nothing yet. Start by adding a recipe or client.", el: "Δεν υπάρχει δραστηριότητα ακόμη." },
  "No ingredients yet":      { en: "No ingredients yet. Click \"Add Ingredient\" to start.", el: "Δεν υπάρχουν υλικά. Κάνε κλικ στο \"Προσθήκη Υλικού\"." },
  "Untitled profile":        { en: "Untitled profile",        el: "Ανώνυμο προφίλ" },
  "Untitled Plan":           { en: "Untitled Plan",           el: "Ανώνυμο Πλάνο" },
  "Meal Plan":               { en: "Meal Plan",               el: "Πλάνο Γευμάτων" },
  "Add your first client":   { en: "Add your first client",   el: "Πρόσθεσε τον πρώτο σου πελάτη" },
  "Most Used Recipes":       { en: "Most Used Recipes",       el: "Πιο Χρησιμοποιημένες Συνταγές" },
  "assigned":                { en: "assigned",                el: "αναθέσεις" },
  "Not used yet":            { en: "No recipes have been assigned to a plan yet.", el: "Δεν έχει ανατεθεί ακόμη καμία συνταγή σε πλάνο." },
  "Add recipe":              { en: "Add recipe",              el: "Προσθήκη συνταγής" },
  "All macros per serving":  { en: "All macros per serving",  el: "Όλα τα μακρο ανά μερίδα" },
  "All values per 100g":     { en: "All values per 100g",     el: "Τιμές ανά 100γρ" },

  // ── Auth ──────────────────────────────────────────────────
  "Forgot password":         { en: "Forgot password?",        el: "Ξέχασα τον κωδικό" },
  "Reset password":          { en: "Reset password",          el: "Επαναφορά κωδικού" },
  "Sign in":                 { en: "Sign in",                 el: "Σύνδεση" },
  "Sign in to your account": { en: "Sign in to your account", el: "Σύνδεση στο λογαριασμό σου" },
  "Signing in…":             { en: "Signing in…",             el: "Σύνδεση…" },
  "Sign up":                 { en: "Sign up",                 el: "Εγγραφή" },
  "Sign up to sign in":      { en: "Sign up",                 el: "Εγγραφή" },
  "Create account":          { en: "Create account",          el: "Δημιουργία λογαριασμού" },
  "Creating account…":       { en: "Creating account…",       el: "Δημιουργία…" },
  "Create your coach account":{ en: "Create your coach account", el: "Δημιούργησε τον λογαριασμό σου" },
  "Don't have an account?":  { en: "Don't have an account?",  el: "Δεν έχεις λογαριασμό;" },
  "Already have an account?":{ en: "Already have an account?",el: "Έχεις ήδη λογαριασμό;" },
  "Send reset link":         { en: "Send reset link",         el: "Αποστολή συνδέσμου" },
  "Sending…":                { en: "Sending…",                el: "Αποστολή…" },
  "Back to sign in":         { en: "Back to sign in",         el: "Πίσω στη σύνδεση" },
  "Remember your password?": { en: "Remember your password?", el: "Θυμάσαι τον κωδικό σου;" },
  "Choose a new password":   { en: "Choose a new password",   el: "Επιλογή νέου κωδικού" },
  "Resetting…":              { en: "Resetting…",              el: "Επαναφορά…" },
  "Password has been reset": { en: "Your password has been reset.", el: "Ο κωδικός σου επαναφέρθηκε." },
  "Sign in with new password":{ en: "Sign in with your new password", el: "Σύνδεση με τον νέο κωδικό" },
  "Reset link invalid":      { en: "This reset link is invalid or missing.", el: "Ο σύνδεσμος επαναφοράς δεν είναι έγκυρος." },
  "Request a new link":      { en: "Request a new link",      el: "Αίτηση νέου συνδέσμου" },
  "Enter your email for reset":{ en: "Enter your email and we'll send you a link to reset your password.", el: "Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς." },

  // ── Recipe form ───────────────────────────────────────────
  "Edit Recipe":             { en: "Edit Recipe",             el: "Επεξεργασία Συνταγής" },
  "Build a macro-accurate recipe": { en: "Build a macro-accurate recipe", el: "Δημιούργησε μακροακριβή συνταγή" },
  "Add Ingredient":          { en: "Add Ingredient",          el: "Προσθήκη Υλικού" },
  "Grams":                   { en: "Grams",                   el: "Γραμμάρια" },
  "Amount":                  { en: "Amount",                  el: "Ποσότητα" },
  "pinch":                   { en: "pinch",                   el: "πρέζα" },
  "Quick add":               { en: "Quick add",               el: "Γρήγορη προσθήκη" },
  "All statuses":            { en: "All statuses",            el: "Όλες οι συνταγές" },
  "Search recipes…":         { en: "Search recipes…",         el: "Αναζήτηση συνταγών…" },
  "Search clients…":         { en: "Search clients…",         el: "Αναζήτηση πελατών…" },
  "Search ingredients…":     { en: "Search ingredients…",     el: "Αναζήτηση υλικών…" },
  "All categories":          { en: "All categories",          el: "Όλες οι κατηγορίες" },
  "Archive recipe?":         { en: "Archive recipe?",         el: "Αρχειοθέτηση συνταγής;" },
  "Archive recipe confirm":  { en: "You can restore it later by selecting the Archived filter on the recipes page.", el: "Μπορείς να την επαναφέρεις αργότερα από τη σελίδα Συνταγών." },
  "Type / Cuisine":          { en: "Type / Cuisine",          el: "Τύπος / Κουζίνα" },

  // ── Client form ───────────────────────────────────────────
  "Create Client":           { en: "Create Client",           el: "Δημιουργία Πελάτη" },
  "Daily targets":           { en: "Daily targets for this client", el: "Ημερήσιοι στόχοι για τον πελάτη" },
  "Set as Active Profile":   { en: "Set as Active Profile",   el: "Ορισμός ως Ενεργό Προφίλ" },
  "Plan runs 7 days":        { en: "Plan runs 7 days · ends", el: "Το πλάνο διαρκεί 7 ημέρες · λήγει" },
  "Create Plan":             { en: "Create Plan",             el: "Δημιουργία Πλάνου" },
  "Target:":                 { en: "Target:",                 el: "Στόχος:" },

  // ── Ingredient categories ─────────────────────────────────
  "cat:protein":             { en: "Protein",                 el: "Πρωτεΐνη" },
  "cat:carb":                { en: "Carb",                    el: "Υδατάνθρακας" },
  "cat:fat":                 { en: "Fat",                     el: "Λίπος" },
  "cat:vegetable":           { en: "Vegetable",               el: "Λαχανικό" },
  "cat:fruit":               { en: "Fruit",                   el: "Φρούτο" },
  "cat:dairy":               { en: "Dairy",                   el: "Γαλακτοκομικό" },
  "cat:seasoning":           { en: "Seasoning",               el: "Μπαχαρικό" },
  "cat:other":               { en: "Other",                   el: "Άλλο" },

  // ── Ingredients page ──────────────────────────────────────
  "USDA verified":           { en: "USDA verified",           el: "USDA εγκεκριμένο" },
  "Read-only library":       { en: "All nutrition values are per 100g · Read-only library", el: "Τιμές ανά 100γρ · Βιβλιοθήκη μόνο ανάγνωσης" },

  // ── Settings ──────────────────────────────────────────────
  "Settings coming soon":    { en: "Settings coming soon.",   el: "Ρυθμίσεις σύντομα." },

  // ── Error / not-found ─────────────────────────────────────
  "Something went wrong":    { en: "Something went wrong",    el: "Κάτι πήγε στραβά" },
  "Error description":       { en: "An unexpected error occurred. Please try again.", el: "Προέκυψε απροσδόκητο σφάλμα. Δοκίμασε ξανά." },
  "Page not found":          { en: "Page not found",          el: "Η σελίδα δεν βρέθηκε" },
  "Page not found description": { en: "The page you're looking for doesn't exist.", el: "Η σελίδα που ψάχνεις δεν υπάρχει." },

  // ── Page descriptions ─────────────────────────────────────
  "Recipes page description":{ en: "Create and manage your macro-accurate recipes", el: "Δημιουργία και διαχείριση μακροακριβών συνταγών" },
  "Clients page description":{ en: "Manage your clients and their macro targets", el: "Διαχείριση πελατών και μακροστόχων" },
  "New client description":  { en: "Add a client and set their initial macro targets", el: "Προσθήκη πελάτη με αρχικούς μακροστόχους" },
  "/ serving":               { en: "/ serving",               el: "/ μερίδα" },

  // ── Counts / plurals ──────────────────────────────────────
  "View all":                { en: "View all",                el: "Προβολή όλων" },
  "kcal target":             { en: "kcal target",             el: "kcal στόχος" },
  "No target profile":       { en: "No profile",              el: "Χωρίς προφίλ" },
  "recipe singular":         { en: "recipe",                  el: "συνταγή" },
  "recipe plural":           { en: "recipes",                 el: "συνταγές" },
  "client singular":         { en: "client",                  el: "πελάτης" },
  "client plural":           { en: "clients",                 el: "πελάτες" },
  "plan singular":           { en: "plan",                    el: "πλάνο" },
  "plan plural":             { en: "plans",                   el: "πλάνα" },
  "ingredient singular":     { en: "ingredient",              el: "υλικό" },
  "ingredient plural":       { en: "ingredients",             el: "υλικά" },
  "serving singular":        { en: "serving",                 el: "μερίδα" },
  "serving plural":          { en: "servings",                el: "μερίδες" },
  "Recent activity empty hint": { en: "No activity yet",      el: "Καμία δραστηριότητα ακόμη" },
  "Overview":                { en: "Overview",                el: "Επισκόπηση" },
  "Workspace":               { en: "Workspace",               el: "Χώρος Εργασίας" },
  "View":                    { en: "View",                    el: "Προβολή" },
  "Today":                   { en: "Today",                   el: "Σήμερα" },
  "Earlier":                 { en: "Earlier",                 el: "Παλαιότερα" },
  "Archive client confirm":  { en: "They will no longer appear in your active clients.", el: "Δεν θα εμφανίζεται στους ενεργούς πελάτες." },
  "Plan Status":             { en: "Plan",                     el: "Πλάνο" },
  "All clients":             { en: "All clients",              el: "Όλοι οι πελάτες" },
  "No plan":                 { en: "No plan",                  el: "Χωρίς πλάνο" },
  "Expired":                 { en: "Expired",                  el: "Ληγμένο" },
  "Duplicate Plan":          { en: "Duplicate Plan",           el: "Αντιγραφή Πλάνου" },
  "Duplicate":               { en: "Duplicate",                el: "Αντιγραφή" },
  "Select client":           { en: "Select client",            el: "Επιλογή πελάτη" },
  "Copy of":                 { en: "Copy of",                  el: "Αντίγραφο —" },
  "Duplicating…":            { en: "Duplicating…",             el: "Αντιγραφή…" },

  // ── Recipe form placeholders ──────────────────────────────
  "e.g. Grilled Chicken & Rice":    { en: "e.g. Grilled Chicken & Rice",       el: "π.χ. Κοτόπουλο & Ρύζι" },
  "e.g. Mediterranean":             { en: "e.g. Mediterranean",                 el: "π.χ. Μεσογειακή" },
  "Select meal type":               { en: "Select meal type",                   el: "Επιλογή τύπου γεύματος" },
  "Optional cooking instructions…": { en: "Optional cooking instructions…",     el: "Προαιρετικές οδηγίες μαγειρικής…" },
  "Quantities are for all":         { en: "Quantities are for all",             el: "Ποσότητες για όλες τις" },
  "Title is required":              { en: "Title is required.",                 el: "Ο τίτλος είναι υποχρεωτικός." },
  "Add at least one ingredient":    { en: "Add at least one ingredient.",       el: "Προσθέστε τουλάχιστον ένα υλικό." },
} as const;

export type TranslationKey = keyof typeof dict;

export function t(key: TranslationKey, lang: Lang): string {
  return dict[key][lang];
}

const STATUS_KEYS: Partial<Record<string, TranslationKey>> = {
  draft: "Draft",
  published: "Published",
  active: "Active",
  archived: "Archived",
};

export function tStatus(status: string, lang: Lang): string {
  const key = STATUS_KEYS[status.toLowerCase()];
  return key ? t(key, lang) : status;
}
