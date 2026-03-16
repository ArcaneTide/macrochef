"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMealPlan } from "@/app/(dashboard)/clients/[id]/plans/actions";

export function CreatePlanForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");

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
          Plan Title <span className="text-slate-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="plan-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Week 1 Cut, March Bulk"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="plan-start">Start Date</Label>
        <Input
          id="plan-start"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {endDate && (
          <p className="text-xs text-slate-500">
            Plan runs Mon–Sun · ends{" "}
            <span className="font-medium text-slate-700">{endDate}</span>
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
          Cancel
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Create Plan
        </Button>
      </div>
    </div>
  );
}
