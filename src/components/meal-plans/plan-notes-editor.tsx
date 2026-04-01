"use client";

import { useState, useTransition } from "react";
import { updatePlanNotes } from "@/app/(main)/clients/[id]/plans/actions";

interface Props {
  planId: string;
  initialNotes: string | null;
}

export function PlanNotesEditor({ planId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updatePlanNotes(planId, notes);
    });
  }

  return (
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onBlur={save}
      placeholder="Add notes for your client (e.g. Drink 2L water daily)"
      rows={2}
      disabled={isPending}
      className="w-full resize-none rounded-lg border-l-4 border-[var(--color-olive)] bg-[var(--color-sand)] dark:bg-[#2A2A2A] px-4 py-2.5 text-sm italic font-sans text-slate-700 dark:text-[#C0B8B0] placeholder:text-slate-400 dark:placeholder:text-[#6A6460] outline-none focus:ring-2 focus:ring-[var(--color-olive)]/30 transition-shadow disabled:opacity-60"
    />
  );
}
