"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient, updateClient } from "@/app/(main)/clients/actions";
import { t, type Lang } from "@/lib/translations";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────

export type ClientInitialData = {
  id: string;
  name: string;
  email: string | null;
  notes: string | null;
  dietType?: string | null;
  excludedFoods?: string | null;
  preferredFoods?: string | null;
  trainingTime?: string | null;
  trainingDays?: number | null;
  cookingTime?: string | null;
  mealPrepFriendly?: boolean | null;
};

// ─── Shared select style ──────────────────────────────────

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-[#F5F1EB] dark:bg-[#1E1E1E] dark:border-[#3A3A3A]";

// ─── Create Form (with initial target profile) ────────────

export function CreateClientForm({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Client fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Preference fields
  const [dietType, setDietType] = useState("");
  const [excludedFoods, setExcludedFoods] = useState("");
  const [preferredFoods, setPreferredFoods] = useState("");
  const [trainingTime, setTrainingTime] = useState("");
  const [trainingDays, setTrainingDays] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [mealPrepFriendly, setMealPrepFriendly] = useState(false);

  // Profile fields
  const [label, setLabel] = useState("");
  const [calorieTarget, setCalorieTarget] = useState("");
  const [proteinTarget, setProteinTarget] = useState("");
  const [carbsTarget, setCarbsTarget] = useState("");
  const [fatTarget, setFatTarget] = useState("");

  function handleSubmit() {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!calorieTarget || Number(calorieTarget) < 1) { setError("Calorie target is required."); return; }

    setError(null);
    startTransition(async () => {
      try {
        const result = await createClient(
          {
            name: name.trim(),
            email: email.trim() || "",
            notes: notes.trim() || "",
            dietType: dietType || undefined,
            excludedFoods: excludedFoods || undefined,
            preferredFoods: preferredFoods || undefined,
            trainingTime: (trainingTime as "morning" | "afternoon" | "evening" | "none") || undefined,
            trainingDays: trainingDays !== "" ? Number(trainingDays) : undefined,
            cookingTime: (cookingTime as "low" | "medium" | "high") || undefined,
            mealPrepFriendly: mealPrepFriendly || undefined,
          },
          {
            label: label.trim() || undefined,
            calorieTarget: Number(calorieTarget),
            proteinTarget: Number(proteinTarget) || 0,
            carbsTarget: Number(carbsTarget) || 0,
            fatTarget: Number(fatTarget) || 0,
          }
        );
        if (!result.success) { setError(result.error); return; }
        router.push(`/clients/${result.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Client info */}
      <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F5F1EB] uppercase tracking-wide">
          {t("Client Info", lang)}
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("Name", lang)}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Smith" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("Email", lang)} <span className="text-slate-400 dark:text-[#6A6460] font-normal">(optional)</span></Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">{t("Notes", lang)} <span className="text-slate-400 dark:text-[#6A6460] font-normal">(optional)</span></Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any relevant notes about this client…" rows={3} />
        </div>
      </div>

      {/* Initial target profile */}
      <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F5F1EB] uppercase tracking-wide">
            {t("Initial Macro Targets", lang)}
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#6A6460] mt-0.5">{t("Daily targets", lang)}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="label">{t("Profile Label", lang)} <span className="text-slate-400 dark:text-[#6A6460] font-normal">(optional)</span></Label>
          <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Cut phase, Maintenance" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="calories">{t("Calories", lang)} (kcal)</Label>
            <Input id="calories" type="number" min={1} value={calorieTarget} onChange={(e) => setCalorieTarget(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }} placeholder="2000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="protein">
              {t("Protein", lang)} <span className="text-[var(--color-olive)]">(g)</span>
            </Label>
            <Input id="protein" type="number" min={0} value={proteinTarget} onChange={(e) => setProteinTarget(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }} placeholder="150" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carbs">
              {t("Carbs", lang)} <span className="text-[var(--color-clay)]">(g)</span>
            </Label>
            <Input id="carbs" type="number" min={0} value={carbsTarget} onChange={(e) => setCarbsTarget(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }} placeholder="200" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fat">
              {t("Fat", lang)} <span className="text-[var(--color-terracotta)]">(g)</span>
            </Label>
            <Input id="fat" type="number" min={0} value={fatTarget} onChange={(e) => setFatTarget(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }} placeholder="70" />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F5F1EB] uppercase tracking-wide">
            {t("Preferences", lang)} <span className="text-slate-400 dark:text-[#6A6460] font-normal normal-case text-xs">(optional)</span>
          </h2>
        </div>

        {/* Diet */}
        <div className="space-y-1.5">
          <Label htmlFor="dietType">{t("Diet", lang)}</Label>
          <Input id="dietType" value={dietType} onChange={(e) => setDietType(e.target.value)} placeholder={t("e.g. omnivore, vegetarian, vegan", lang)} maxLength={100} />
        </div>

        {/* Excluded / preferred foods */}
        <div className="space-y-1.5">
          <Label htmlFor="excludedFoods">{t("Excluded foods", lang)}</Label>
          <Textarea id="excludedFoods" value={excludedFoods} onChange={(e) => setExcludedFoods(e.target.value)} placeholder={t("Comma-separated excluded", lang)} rows={2} maxLength={500} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="preferredFoods">{t("Preferred foods", lang)}</Label>
          <Textarea id="preferredFoods" value={preferredFoods} onChange={(e) => setPreferredFoods(e.target.value)} placeholder={t("Comma-separated preferred", lang)} rows={2} maxLength={500} />
        </div>

        {/* Training row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="trainingTime">{t("Training time", lang)}</Label>
            <select id="trainingTime" value={trainingTime} onChange={(e) => setTrainingTime(e.target.value)} className={selectClassName}>
              <option value="">—</option>
              <option value="morning">{t("Morning", lang)}</option>
              <option value="afternoon">{t("Afternoon", lang)}</option>
              <option value="evening">{t("Evening", lang)}</option>
              <option value="none">{t("None", lang)}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trainingDays">{t("Training days/week", lang)}</Label>
            <Input id="trainingDays" type="number" min={0} max={7} value={trainingDays} onChange={(e) => setTrainingDays(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-","."].includes(e.key)) e.preventDefault(); }} placeholder={t("e.g. 4", lang)} />
          </div>
        </div>

        {/* Cooking row */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="cookingTime">{t("Cooking time available", lang)}</Label>
            <select id="cookingTime" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} className={selectClassName}>
              <option value="">—</option>
              <option value="low">{t("Low", lang)}</option>
              <option value="medium">{t("Medium", lang)}</option>
              <option value="high">{t("High", lang)}</option>
            </select>
          </div>
          <div className="flex items-center gap-2.5 pb-1">
            <button
              type="button"
              onClick={() => setMealPrepFriendly((v) => !v)}
              className={cn(
                "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                mealPrepFriendly
                  ? "bg-[var(--color-olive)] border-[var(--color-olive)] text-white"
                  : "border-slate-300 dark:border-[#4A4A4A] bg-white dark:bg-[#1E1E1E]"
              )}
              aria-label={t("Prefers batch-cookable recipes", lang)}
            >
              {mealPrepFriendly && <Check className="h-3 w-3" />}
            </button>
            <span className="text-sm text-slate-700 dark:text-[#D4CEC7] leading-tight">
              {t("Prefers batch-cookable recipes", lang)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/clients")} disabled={isPending}>
          {t("Cancel", lang)}
        </Button>
        <Button className="bg-[var(--color-olive)] hover:bg-[#6A7B5F] text-white" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {t("Create Client", lang)}
        </Button>
      </div>
    </div>
  );
}

// ─── Edit Form (client info only) ────────────────────────

export function EditClientForm({ initialData, onCancel, lang }: { initialData: ClientInitialData; onCancel: () => void; lang: Lang }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email ?? "");
  const [notes, setNotes] = useState(initialData.notes ?? "");

  // Preference fields
  const [dietType, setDietType] = useState(initialData.dietType ?? "");
  const [excludedFoods, setExcludedFoods] = useState(initialData.excludedFoods ?? "");
  const [preferredFoods, setPreferredFoods] = useState(initialData.preferredFoods ?? "");
  const [trainingTime, setTrainingTime] = useState(initialData.trainingTime ?? "");
  const [trainingDays, setTrainingDays] = useState(initialData.trainingDays != null ? String(initialData.trainingDays) : "");
  const [cookingTime, setCookingTime] = useState(initialData.cookingTime ?? "");
  const [mealPrepFriendly, setMealPrepFriendly] = useState(initialData.mealPrepFriendly ?? false);

  function handleSubmit() {
    if (!name.trim()) { setError("Name is required."); return; }
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateClient(initialData.id, {
          name: name.trim(),
          email: email.trim() || "",
          notes: notes.trim() || "",
          dietType: dietType || undefined,
          excludedFoods: excludedFoods || undefined,
          preferredFoods: preferredFoods || undefined,
          trainingTime: (trainingTime as "morning" | "afternoon" | "evening" | "none") || undefined,
          trainingDays: trainingDays !== "" ? Number(trainingDays) : undefined,
          cookingTime: (cookingTime as "low" | "medium" | "high") || undefined,
          mealPrepFriendly: mealPrepFriendly || undefined,
        });
        if (!result.success) { setError(result.error); return; }
        router.refresh();
        onCancel();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">{t("Name", lang)}</Label>
        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-email">{t("Email", lang)} <span className="text-slate-400 dark:text-[#6A6460] font-normal">(optional)</span></Label>
        <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-notes">{t("Notes", lang)}</Label>
        <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>

      {/* Preferences section */}
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#A0998E] pt-1">
        {t("Preferences", lang)}
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="edit-dietType">{t("Diet", lang)}</Label>
        <Input id="edit-dietType" value={dietType} onChange={(e) => setDietType(e.target.value)} placeholder={t("e.g. omnivore, vegetarian, vegan", lang)} maxLength={100} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-excludedFoods">{t("Excluded foods", lang)}</Label>
        <Textarea id="edit-excludedFoods" value={excludedFoods} onChange={(e) => setExcludedFoods(e.target.value)} placeholder={t("Comma-separated excluded", lang)} rows={2} maxLength={500} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-preferredFoods">{t("Preferred foods", lang)}</Label>
        <Textarea id="edit-preferredFoods" value={preferredFoods} onChange={(e) => setPreferredFoods(e.target.value)} placeholder={t("Comma-separated preferred", lang)} rows={2} maxLength={500} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-trainingTime">{t("Training time", lang)}</Label>
          <select id="edit-trainingTime" value={trainingTime} onChange={(e) => setTrainingTime(e.target.value)} className={selectClassName}>
            <option value="">—</option>
            <option value="morning">{t("Morning", lang)}</option>
            <option value="afternoon">{t("Afternoon", lang)}</option>
            <option value="evening">{t("Evening", lang)}</option>
            <option value="none">{t("None", lang)}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-trainingDays">{t("Training days/week", lang)}</Label>
          <Input id="edit-trainingDays" type="number" min={0} max={7} value={trainingDays} onChange={(e) => setTrainingDays(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-","."].includes(e.key)) e.preventDefault(); }} placeholder={t("e.g. 4", lang)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="edit-cookingTime">{t("Cooking time available", lang)}</Label>
          <select id="edit-cookingTime" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} className={selectClassName}>
            <option value="">—</option>
            <option value="low">{t("Low", lang)}</option>
            <option value="medium">{t("Medium", lang)}</option>
            <option value="high">{t("High", lang)}</option>
          </select>
        </div>
        <div className="flex items-center gap-2.5 pb-1">
          <button
            type="button"
            onClick={() => setMealPrepFriendly((v) => !v)}
            className={cn(
              "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
              mealPrepFriendly
                ? "bg-[var(--color-olive)] border-[var(--color-olive)] text-white"
                : "border-slate-300 dark:border-[#4A4A4A] bg-white dark:bg-[#1E1E1E]"
            )}
            aria-label={t("Prefers batch-cookable recipes", lang)}
          >
            {mealPrepFriendly && <Check className="h-3 w-3" />}
          </button>
          <span className="text-sm text-slate-700 dark:text-[#D4CEC7] leading-tight">
            {t("Prefers batch-cookable recipes", lang)}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>{t("Cancel", lang)}</Button>
        <Button className="bg-[var(--color-olive)] hover:bg-[#6A7B5F] text-white" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {t("Save", lang)}
        </Button>
      </div>
    </div>
  );
}
