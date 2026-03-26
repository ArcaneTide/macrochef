"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient, updateClient } from "@/app/(dashboard)/clients/actions";
import { t, type Lang } from "@/lib/translations";

// ─── Types ────────────────────────────────────────────────

export type ClientInitialData = {
  id: string;
  name: string;
  email: string | null;
  notes: string | null;
};

// ─── Create Form (with initial target profile) ────────────

export function CreateClientForm({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Client fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

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
          { name: name.trim(), email: email.trim() || "", notes: notes.trim() || "" },
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          {t("Client Info", lang)}
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("Name", lang)}</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Smith" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("Email", lang)} <span className="text-slate-400 font-normal">(optional)</span></Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">{t("Notes", lang)} <span className="text-slate-400 font-normal">(optional)</span></Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any relevant notes about this client…" rows={3} />
        </div>
      </div>

      {/* Initial target profile */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            {t("Initial Macro Targets", lang)}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{t("Daily targets", lang)}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="label">{t("Profile Label", lang)} <span className="text-slate-400 font-normal">(optional)</span></Label>
          <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Cut phase, Maintenance" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="calories">{t("Calories", lang)} (kcal)</Label>
            <Input id="calories" type="number" min={1} value={calorieTarget} onChange={(e) => setCalorieTarget(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }} placeholder="2000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="protein">
              {t("Protein", lang)} <span className="text-blue-500">(g)</span>
            </Label>
            <Input id="protein" type="number" min={0} value={proteinTarget} onChange={(e) => setProteinTarget(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }} placeholder="150" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="carbs">
              {t("Carbs", lang)} <span className="text-amber-500">(g)</span>
            </Label>
            <Input id="carbs" type="number" min={0} value={carbsTarget} onChange={(e) => setCarbsTarget(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }} placeholder="200" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fat">
              {t("Fat", lang)} <span className="text-orange-500">(g)</span>
            </Label>
            <Input id="fat" type="number" min={0} value={fatTarget} onChange={(e) => setFatTarget(e.target.value)} onKeyDown={(e) => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }} placeholder="70" />
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
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit} disabled={isPending}>
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

  function handleSubmit() {
    if (!name.trim()) { setError("Name is required."); return; }
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateClient(initialData.id, {
          name: name.trim(),
          email: email.trim() || "",
          notes: notes.trim() || "",
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
        <Label htmlFor="edit-email">{t("Email", lang)} <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-notes">{t("Notes", lang)}</Label>
        <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>{t("Cancel", lang)}</Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {t("Save", lang)}
        </Button>
      </div>
    </div>
  );
}
