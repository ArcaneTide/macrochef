"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createMealPlan } from "@/app/(main)/clients/[id]/plans/actions";
import { t, type Lang } from "@/lib/translations";

const ALL_SLOTS = ["breakfast", "lunch", "dinner", "snack1", "snack2"] as const;
type SlotKey = (typeof ALL_SLOTS)[number];

function realisticDefaults(slots: string[]): Record<string, string> {
  if (slots.length === 0) return {};
  if (slots.length === 1) return { [slots[0]]: "100" };

  const set = new Set(slots);

  if (
    slots.length === 5 &&
    set.has("breakfast") && set.has("lunch") && set.has("dinner") &&
    set.has("snack1") && set.has("snack2")
  ) {
    return { breakfast: "20", lunch: "30", dinner: "30", snack1: "10", snack2: "10" };
  }

  if (
    slots.length === 4 &&
    set.has("breakfast") && set.has("lunch") && set.has("dinner") &&
    set.has("snack1") && !set.has("snack2")
  ) {
    return { breakfast: "25", lunch: "30", dinner: "30", snack1: "15" };
  }

  if (
    slots.length === 3 &&
    set.has("breakfast") && set.has("lunch") && set.has("dinner")
  ) {
    return { breakfast: "25", lunch: "35", dinner: "40" };
  }

  if (slots.length === 2) {
    return Object.fromEntries(slots.map((s) => [s, "50"]));
  }

  // Fallback: equal split
  const base = Math.floor(100 / slots.length);
  const rem = 100 - base * slots.length;
  return Object.fromEntries(slots.map((s, i) => [s, String(base + (i < rem ? 1 : 0))]));
}

export function CreatePlanForm({ clientId, lang }: { clientId: string; lang: Lang }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [activeSlots, setActiveSlots] = useState<string[]>(["breakfast", "lunch", "dinner", "snack1"]);
  const [distribution, setDistribution] = useState<Record<string, string>>(
    () => realisticDefaults(["breakfast", "lunch", "dinner", "snack1"])
  );
  const [showDistribution, setShowDistribution] = useState(false);

  const SLOT_LABELS: Record<SlotKey, string> = {
    breakfast: t("Breakfast", lang),
    lunch: t("Lunch", lang),
    dinner: t("Dinner", lang),
    snack1: t("Snack 1", lang),
    snack2: t("Snack 2", lang),
  };

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const endDate = startDate
    ? (() => {
        const d = new Date(startDate + "T00:00:00");
        d.setDate(d.getDate() + 6);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      })()
    : null;

  const distributionSum = activeSlots.reduce(
    (sum, s) => sum + (parseInt(distribution[s] ?? "0", 10) || 0),
    0
  );
  const distributionValid = activeSlots.length <= 1 || distributionSum === 100;

  function toggleSlot(slot: string) {
    const next = activeSlots.includes(slot)
      ? activeSlots.filter((s) => s !== slot)
      : [...activeSlots, slot];
    const ordered = ALL_SLOTS.filter((s) => next.includes(s));
    setActiveSlots(ordered);
    setDistribution(realisticDefaults(ordered));
  }

  function handleSubmit() {
    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    if (activeSlots.length === 0) {
      setError("Select at least one meal slot.");
      return;
    }
    if (!distributionValid) {
      setError(t("Distributions must sum to 100%", lang));
      return;
    }
    setError(null);

    const slotDist: Record<string, number> = {};
    for (const s of activeSlots) {
      slotDist[s] = parseInt(distribution[s] ?? "0", 10) || 0;
    }

    startTransition(async () => {
      try {
        const result = await createMealPlan(clientId, {
          title: title.trim() || undefined,
          startDate,
          activeSlots: activeSlots as SlotKey[],
          slotDistribution: slotDist,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.push(`/clients/${clientId}/plans/${result.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="max-w-md space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="plan-title">
          {t("Plan Title", lang)}{" "}
          <span className="text-slate-400 dark:text-[#6A6460] font-normal">(optional)</span>
        </Label>
        <Input
          id="plan-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Week 1 Cut, March Bulk"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="plan-start">{t("Start Date", lang)}</Label>
        <Input
          id="plan-start"
          type="date"
          value={startDate}
          min={today}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {endDate && (
          <p className="text-xs text-slate-500 dark:text-[#A0998E]">
            {t("Plan runs 7 days", lang)}{" "}
            <span className="font-medium text-slate-700 dark:text-[#D4CEC7]">{endDate}</span>
          </p>
        )}
      </div>

      {/* Meals section */}
      <div className="space-y-4 rounded-lg border border-[var(--color-sand)] p-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-[#D4CEC7]">
          {t("Meals", lang)}
        </p>

        {/* Slot checkboxes */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500 dark:text-[#A0998E] uppercase tracking-wide">
            {t("Active Slots", lang)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_SLOTS.map((slot) => {
              const checked = activeSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-left transition-colors",
                    checked
                      ? "border-[var(--color-olive)] bg-[#EDF1EB] text-[#5A6B4F] dark:bg-[#232A1F] dark:text-[#8FAB7D]"
                      : "border-[var(--color-sand)] text-slate-500 hover:bg-slate-50 dark:hover:bg-[#2A2A2A]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      checked
                        ? "border-[var(--color-olive)] bg-[var(--color-olive)]"
                        : "border-slate-300 dark:border-[#5A5A5A]"
                    )}
                  >
                    {checked && <Check className="h-3 w-3 text-white" />}
                  </span>
                  {SLOT_LABELS[slot]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distribution toggle + inputs */}
        {activeSlots.length > 1 && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowDistribution((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A0998E] hover:text-slate-700 dark:hover:text-[#D4CEC7] transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showDistribution && "rotate-180"
                )}
              />
              {t("Customize meal distribution", lang)}
            </button>

            {showDistribution && (
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {activeSlots.map((slot) => (
                    <div key={slot} className="space-y-0.5">
                      <p className="text-[11px] text-slate-400 dark:text-[#6A6460]">
                        {SLOT_LABELS[slot as SlotKey]}
                      </p>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={distribution[slot] ?? ""}
                          onChange={(e) =>
                            setDistribution((prev) => ({ ...prev, [slot]: e.target.value }))
                          }
                          className="w-16 text-center text-sm bg-white dark:bg-[#242424]"
                        />
                        <span className="text-xs text-slate-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p
                  className={cn(
                    "text-xs tabular-nums font-data",
                    distributionValid
                      ? "text-[#5A6B4F]"
                      : "text-[var(--color-clay)]"
                  )}
                >
                  {distributionSum}% / 100%{distributionValid ? " ✓" : ""}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={isPending}>
          {t("Cancel", lang)}
        </Button>
        <Button
          className="bg-[var(--color-olive)] hover:bg-[#6A7B5F] text-white"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {t("Create Plan", lang)}
        </Button>
      </div>
    </div>
  );
}
