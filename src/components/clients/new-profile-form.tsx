"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTargetProfile } from "@/app/(dashboard)/clients/actions";

export function NewProfileForm({
  clientId,
  onCancel,
}: {
  clientId: string;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [calorieTarget, setCalorieTarget] = useState("");
  const [proteinTarget, setProteinTarget] = useState("");
  const [carbsTarget, setCarbsTarget] = useState("");
  const [fatTarget, setFatTarget] = useState("");

  function handleSubmit() {
    if (!calorieTarget || Number(calorieTarget) < 1) {
      setError("Calorie target is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await createTargetProfile(clientId, {
          label: label.trim() || undefined,
          calorieTarget: Number(calorieTarget),
          proteinTarget: Number(proteinTarget) || 0,
          carbsTarget: Number(carbsTarget) || 0,
          fatTarget: Number(fatTarget) || 0,
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
        <Label htmlFor="p-label">
          Label <span className="text-slate-400 font-normal">(optional)</span>
        </Label>
        <Input
          id="p-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Cut phase, Bulk, Maintenance"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-calories">Calories (kcal)</Label>
          <Input
            id="p-calories"
            type="number"
            min={1}
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(e.target.value)}
            placeholder="2000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-protein">
            Protein <span className="text-blue-500">(g)</span>
          </Label>
          <Input
            id="p-protein"
            type="number"
            min={0}
            value={proteinTarget}
            onChange={(e) => setProteinTarget(e.target.value)}
            placeholder="150"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-carbs">
            Carbs <span className="text-amber-500">(g)</span>
          </Label>
          <Input
            id="p-carbs"
            type="number"
            min={0}
            value={carbsTarget}
            onChange={(e) => setCarbsTarget(e.target.value)}
            placeholder="200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-fat">
            Fat <span className="text-orange-500">(g)</span>
          </Label>
          <Input
            id="p-fat"
            type="number"
            min={0}
            value={fatTarget}
            onChange={(e) => setFatTarget(e.target.value)}
            placeholder="70"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Set as Active Profile
        </Button>
      </div>
    </div>
  );
}
