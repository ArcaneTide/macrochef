"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/translations";

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
        <p className="text-sm text-slate-500 sm:ml-auto whitespace-nowrap hidden sm:block">
          {filtered.length} client{filtered.length !== 1 ? "s" : ""}
        </p>
        <Link href="/clients/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
            <Plus className="h-4 w-4" />
            {t("New Client", lang)}
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          {clients.length === 0 ? (
            <div className="space-y-3">
              <p>{t("No clients yet", lang)}</p>
              <Link href="/clients/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
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
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow">
          {/* Desktop table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">{t("Name", lang)}</th>
                <th className="text-left px-4 py-3">{t("Status", lang)}</th>
                <th className="text-left px-4 py-3">{t("Active Macro Targets", lang)}</th>
                <th className="text-right px-4 py-3">{t("Calories", lang)}</th>
                <th className="text-right px-4 py-3">{t("Protein", lang)}</th>
                <th className="text-right px-4 py-3">{t("Carbs", lang)}</th>
                <th className="text-right px-4 py-3">{t("Fat", lang)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-slate-100 cursor-pointer transition-colors even:bg-slate-50/40"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{client.name}</p>
                    {client.email && (
                      <p className="text-xs text-slate-400">{client.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium border capitalize",
                        STATUS_STYLES[client.status] ?? STATUS_STYLES.active
                      )}
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {client.activeProfile?.label ?? (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
                    {client.activeProfile ? `${client.activeProfile.calorieTarget} kcal` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-blue-600 tabular-nums font-medium">
                    {client.activeProfile ? `${client.activeProfile.proteinTarget}g` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-amber-600 tabular-nums font-medium">
                    {client.activeProfile ? `${client.activeProfile.carbsTarget}g` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-orange-600 tabular-nums font-medium">
                    {client.activeProfile ? `${client.activeProfile.fatTarget}g` : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-medium text-slate-900">{client.name}</p>
                    {client.email && (
                      <p className="text-xs text-slate-400">{client.email}</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border capitalize shrink-0",
                      STATUS_STYLES[client.status] ?? STATUS_STYLES.active
                    )}
                  >
                    {client.status}
                  </Badge>
                </div>
                {client.activeProfile && (
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { label: "Kcal", value: `${client.activeProfile.calorieTarget}`, color: "text-slate-700" },
                      { label: "P", value: `${client.activeProfile.proteinTarget}g`, color: "text-blue-600" },
                      { label: "C", value: `${client.activeProfile.carbsTarget}g`, color: "text-amber-600" },
                      { label: "F", value: `${client.activeProfile.fatTarget}g`, color: "text-orange-600" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className={cn("font-medium tabular-nums", color)}>{value}</p>
                        <p className="text-slate-400">{label}</p>
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
