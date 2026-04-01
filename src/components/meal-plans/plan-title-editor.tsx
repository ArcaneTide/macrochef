"use client";

import { useState, useRef, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updatePlanTitle } from "@/app/(main)/clients/[id]/plans/actions";

interface Props {
  planId: string;
  initialTitle: string | null;
  fallbackLabel: string;
}

export function PlanTitleEditor({ planId, initialTitle, fallbackLabel }: Props) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function save() {
    setEditing(false);
    startTransition(async () => {
      await updatePlanTitle(planId, title);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setTitle(initialTitle ?? "");
      setEditing(false);
    }
  }

  const displayTitle = title.trim() || fallbackLabel;

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        placeholder={fallbackLabel}
        className="text-2xl font-sans font-bold text-slate-900 dark:text-[#F5F1EB] bg-transparent border-b-2 border-[var(--color-clay)] outline-none w-full max-w-md"
        disabled={isPending}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group flex items-center gap-2 text-left"
      title="Click to edit plan title"
    >
      <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-[#F5F1EB]">
        {displayTitle}
      </h1>
      <Pencil className="h-4 w-4 text-slate-300 dark:text-[#4A4A4A] group-hover:text-[var(--color-clay)] transition-colors shrink-0" />
    </button>
  );
}
