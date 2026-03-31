"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { duplicatePlan } from "@/app/(main)/clients/[id]/plans/actions";
import { t, type Lang } from "@/lib/translations";

export type ClientOption = { id: string; name: string };

interface Props {
  sourcePlanId: string;
  sourcePlanTitle: string | null;
  currentClientId: string;
  clients: ClientOption[];
  lang: Lang;
}

export function DuplicatePlanModal({
  sourcePlanId,
  sourcePlanTitle,
  currentClientId,
  clients,
  lang,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaultTitle = sourcePlanTitle
    ? `${t("Copy of", lang)} ${sourcePlanTitle}`
    : "";

  const [title, setTitle] = useState(defaultTitle);
  const [clientId, setClientId] = useState(currentClientId);
  const [startDate, setStartDate] = useState("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const endDate = startDate
    ? (() => {
        const d = new Date(startDate + "T00:00:00");
        d.setDate(d.getDate() + 6);
        return d.toLocaleDateString(lang === "el" ? "el-GR" : "en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      })()
    : null;

  function handleClose() {
    if (isPending) return;
    setError(null);
    setStartDate("");
    setTitle(defaultTitle);
    setClientId(currentClientId);
    setOpen(false);
  }

  function handleSubmit() {
    if (!startDate) { setError("Start date is required."); return; }
    if (!clientId) { setError("Client is required."); return; }
    setError(null);

    startTransition(async () => {
      const result = await duplicatePlan(sourcePlanId, clientId, startDate, title || undefined);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.push(`/clients/${result.clientId}/plans/${result.id}`);
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 border-[#E8E0D4] dark:border-[#3A3A3A]"
      >
        <Copy className="h-3.5 w-3.5" />
        {t("Duplicate Plan", lang)}
      </Button>

    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#242424] border-[#E8E0D4] dark:border-[#3A3A3A]">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-[#F5F1EB]">
            {t("Duplicate Plan", lang)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="dup-title">
              {t("Plan Title", lang)}{" "}
              <span className="text-slate-400 dark:text-[#6A6460] font-normal">(optional)</span>
            </Label>
            <Input
              id="dup-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 2 Cut"
            />
          </div>

          {/* Client */}
          <div className="space-y-1.5">
            <Label>{t("Select client", lang)}</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("Select client", lang)} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start date */}
          <div className="space-y-1.5">
            <Label htmlFor="dup-start">{t("Start Date", lang)}</Label>
            <Input
              id="dup-start"
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

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={handleClose} disabled={isPending} className="flex-1">
              {t("Cancel", lang)}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 bg-[var(--color-olive)] hover:bg-[#6A7B5F] text-white"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {isPending ? t("Duplicating…", lang) : t("Duplicate", lang)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
