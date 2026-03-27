"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { updateMealPlanStatus } from "@/app/(dashboard)/clients/[id]/plans/actions";
import { t, tStatus, type Lang } from "@/lib/translations";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-400 border-slate-200",
};

type Props = {
  planId: string;
  clientId: string;
  currentStatus: "draft" | "active" | "archived";
  lang: Lang;
};

export function PlanStatusBar({ planId, clientId, currentStatus, lang }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function changeStatus(next: "draft" | "active" | "archived") {
    startTransition(async () => {
      const result = await updateMealPlanStatus(planId, next);
      if (result.success) {
        setStatus(next);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <a
        href={`/api/plans/${planId}/pdf`}
        download
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        {t("Download PDF", lang)}
      </a>

      <Badge
        variant="outline"
        className={cn("text-xs font-medium border", STATUS_STYLES[status])}
      >
        {tStatus(status, lang)}
      </Badge>

      {status === "draft" && (
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => changeStatus("active")}
          disabled={isPending}
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
          {t("Activate", lang)}
        </Button>
      )}

      {status === "active" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => changeStatus("archived")}
          disabled={isPending}
          className="text-slate-500"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
          {t("Archive", lang)}
        </Button>
      )}

      {status === "archived" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => changeStatus("draft")}
          disabled={isPending}
          className="text-slate-500"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
          {t("Restore", lang)}
        </Button>
      )}
    </div>
  );
}
