"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMealPlan } from "@/app/(main)/clients/[id]/plans/actions";
import { t, type Lang } from "@/lib/translations";

export function CreatePlanForm({ clientId, lang }: { clientId: string; lang: Lang }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const endDate = startDate
    ? (() => {
        const d = new Date(startDate + "T00:00:00");
        d.setDate(d.getDate() + 6);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      })()
    : null;

  function handleSubmit() {
    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await createMealPlan(clientId, {
          title: title.trim() || undefined,
          startDate,
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
          {t("Plan Title", lang)} <span className="text-slate-400 dark:text-[#6A6460] font-normal">(optional)</span>
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

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          {t("Cancel", lang)}
        </Button>
        <Button
          className="bg-[#7A8B6F] hover:bg-[#6A7B5F] text-white"
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
