"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { t, tStatus, type Lang } from "@/lib/translations";

export type ClientListItem = {
  id: string;
  name: string;
  email: string | null;
  status: string;
  activeProfile: {
    label: string | null;
    calorieTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
  } | null;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

export function ClientListClient({ clients, lang }: { clients: ClientListItem[]; lang: Lang }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.trim().toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, search]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder={t("Search clients…", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-[#A0998E] sm:ml-auto whitespace-nowrap hidden sm:block">
          {filtered.length} {filtered.length !== 1 ? t("client plural", lang) : t("client singular", lang)}
        </p>
        <Link href="/clients/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#7A8B6F] hover:bg-[#6A7B5F] text-white gap-1.5">
            <Plus className="h-4 w-4" />
            {t("New Client", lang)}
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-[#6A6460]">
          {clients.length === 0 ? (
            <div className="space-y-3">
              <p>{t("No clients yet", lang)}</p>
              <Link href="/clients/new">
                <Button className="bg-[#7A8B6F] hover:bg-[#6A7B5F] text-white gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t("Add your first client", lang)}
                </Button>
              </Link>
            </div>
          ) : (
            <p>{t("No clients match search", lang)}</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] overflow-hidden shadow">
          {/* Desktop table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-[#E8E0D4] dark:border-[#3A3A3A] bg-slate-50 dark:bg-[#1E1E1E] text-xs font-medium text-slate-500 dark:text-[#A0998E] uppercase tracking-wide">
                <th className="text-left px-4 py-3">{t("Name", lang)}</th>
                <th className="text-left px-4 py-3">{t("Status", lang)}</th>
                <th className="text-left px-4 py-3">{t("Active Macro Targets", lang)}</th>
                <th className="text-right px-4 py-3">{t("Calories", lang)}</th>
                <th className="text-right px-4 py-3">{t("Protein", lang)}</th>
                <th className="text-right px-4 py-3">{t("Carbs", lang)}</th>
                <th className="text-right px-4 py-3">{t("Fat", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E0D4] dark:divide-[#3A3A3A]">
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-slate-100 dark:hover:bg-[#2A2A2A] cursor-pointer transition-colors even:bg-slate-50/40 dark:even:bg-[#1E1E1E]/30"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-[#F5F1EB]">{client.name}</p>
                    {client.email && (
                      <p className="text-xs text-slate-400 dark:text-[#6A6460]">{client.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium border",
                        STATUS_STYLES[client.status] ?? STATUS_STYLES.active
                      )}
                    >
                      {tStatus(client.status, lang)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-[#A0998E]">
                    {client.activeProfile?.label ?? (
                      <span className="text-slate-300 dark:text-[#4A4A4A]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600 dark:text-[#A0998E] tabular-nums">
                    {client.activeProfile ? `${client.activeProfile.calorieTarget} kcal` : <span className="text-slate-300 dark:text-[#4A4A4A]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#5A6B4F] tabular-nums font-medium">
                    {client.activeProfile ? `${client.activeProfile.proteinTarget}g` : <span className="text-slate-300 dark:text-[#4A4A4A]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#B8907A] tabular-nums font-medium">
                    {client.activeProfile ? `${client.activeProfile.carbsTarget}g` : <span className="text-slate-300 dark:text-[#4A4A4A]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[#C4724E] tabular-nums font-medium">
                    {client.activeProfile ? `${client.activeProfile.fatTarget}g` : <span className="text-slate-300 dark:text-[#4A4A4A]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-[#E8E0D4] dark:divide-[#3A3A3A]">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-[#F5F1EB]">{client.name}</p>
                    {client.email && (
                      <p className="text-xs text-slate-400 dark:text-[#6A6460]">{client.email}</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border shrink-0",
                      STATUS_STYLES[client.status] ?? STATUS_STYLES.active
                    )}
                  >
                    {tStatus(client.status, lang)}
                  </Badge>
                </div>
                {client.activeProfile && (
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { label: "Kcal", value: `${client.activeProfile.calorieTarget}`, color: "text-slate-700 dark:text-[#A0998E]" },
                      { label: "P", value: `${client.activeProfile.proteinTarget}g`, color: "text-[#5A6B4F]" },
                      { label: "C", value: `${client.activeProfile.carbsTarget}g`, color: "text-[#B8907A]" },
                      { label: "F", value: `${client.activeProfile.fatTarget}g`, color: "text-[#C4724E]" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className={cn("font-medium tabular-nums", color)}>{value}</p>
                        <p className="text-slate-400 dark:text-[#6A6460]">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
