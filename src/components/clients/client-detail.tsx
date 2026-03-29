"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Archive, CalendarDays, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EditClientForm, type ClientInitialData } from "@/components/clients/client-form";
import { NewProfileForm } from "@/components/clients/new-profile-form";
import { archiveClient } from "@/app/(main)/clients/actions";
import { t, tStatus, type Lang } from "@/lib/translations";

export type TargetProfile = {
  id: string;
  label: string | null;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  isActive: boolean;
  createdAt: string;
};

export type MealPlanSummary = {
  id: string;
  title: string | null;
  status: string;
  startDate: string;
  endDate: string;
};

export type ClientDetailProps = {
  client: {
    id: string;
    name: string;
    email: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
  };
  profiles: TargetProfile[];
  plans: MealPlanSummary[];
  lang: Lang;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#EDF1EB] text-[#7A8B6F] border-[#c5d0bf]",
  archived: "bg-slate-100 text-slate-500 border-[#E8E0D4] dark:bg-[#2A2A2A] dark:text-[#6A6460] dark:border-[#3A3A3A]",
};

function MacroRow({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-500 dark:text-[#A0998E]">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", color)}>
        {value}
        <span className="text-xs font-normal ml-0.5 text-slate-400 dark:text-[#6A6460]">{unit}</span>
      </span>
    </div>
  );
}

const PLAN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#E8E0D4] text-[#4A4A4A] border-[#d4c8bc] dark:bg-[#2A2A2A] dark:text-[#A0998E] dark:border-[#3A3A3A]",
  active: "bg-[#7A8B6F] text-white border-[#6A7B5F]",
  archived: "bg-slate-100 text-slate-400 border-slate-200 dark:bg-[#2A2A2A] dark:text-[#6A6460] dark:border-[#3A3A3A]",
};

export function ClientDetail({ client, profiles, plans, lang }: ClientDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [isArchiving, startArchiveTransition] = useTransition();

  const activeProfile = profiles.find((p) => p.isActive) ?? null;
  const pastProfiles = profiles.filter((p) => !p.isActive);

  function handleArchive() {
    if (!confirm(`${t("Archive", lang)} ${client.name}? ${t("Archive client confirm", lang)}`)) return;
    startArchiveTransition(async () => {
      await archiveClient(client.id);
      router.push("/clients");
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Client info card */}
      <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow">
        {isEditing ? (
          <>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F5F1EB] uppercase tracking-wide mb-5">
              {t("Edit Client", lang)}
            </h2>
            <EditClientForm
              initialData={client as ClientInitialData}
              onCancel={() => setIsEditing(false)}
              lang={lang}
            />
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-[#F5F1EB]">{client.name}</h2>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border",
                      STATUS_STYLES[client.status] ?? STATUS_STYLES.active
                    )}
                  >
                    {tStatus(client.status, lang)}
                  </Badge>
                </div>
                {client.email && (
                  <p className="text-sm text-slate-500 dark:text-[#A0998E] mt-0.5">{client.email}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("Edit", lang)}
                </Button>
                {client.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleArchive}
                    disabled={isArchiving}
                    className="gap-1.5 text-slate-500"
                  >
                    {isArchiving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Archive className="h-3.5 w-3.5" />
                    )}
                    {t("Archive", lang)}
                  </Button>
                )}
              </div>
            </div>
            {client.notes && (
              <p className="text-sm text-slate-600 dark:text-[#C0B8B0] bg-slate-50 dark:bg-[#1E1E1E] rounded-lg p-3 whitespace-pre-wrap">
                {client.notes}
              </p>
            )}
          </>
        )}
      </div>

      {/* Active target profile */}
      <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F1EB] uppercase tracking-wide">
              {t("Active Macro Targets", lang)}
            </h3>
            {activeProfile?.label && (
              <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-olive)" }}>{activeProfile.label}</p>
            )}
          </div>
          {!isAddingProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingProfile(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("New Profile", lang)}
            </Button>
          )}
        </div>

        {isAddingProfile ? (
          <NewProfileForm
            clientId={client.id}
            onCancel={() => setIsAddingProfile(false)}
            lang={lang}
          />
        ) : activeProfile ? (
          <div className="divide-y divide-[#E8E0D4] dark:divide-[#3A3A3A]">
            <MacroRow label={t("Calories", lang)} value={activeProfile.calorieTarget} unit="kcal" color="text-slate-900 dark:text-[#F5F1EB]" />
            <MacroRow label={t("Protein", lang)} value={activeProfile.proteinTarget} unit="g" color="text-[#5A6B4F]" />
            <MacroRow label={t("Carbs", lang)} value={activeProfile.carbsTarget} unit="g" color="text-[#B8907A]" />
            <MacroRow label={t("Fat", lang)} value={activeProfile.fatTarget} unit="g" color="text-[#C4724E]" />
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-[#6A6460] text-center py-4">
            {t("No active profile", lang)}
          </p>
        )}
      </div>

      {/* Profile history */}
      {pastProfiles.length > 0 && (
        <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F1EB] uppercase tracking-wide mb-4">
            {t("Profile History", lang)}
          </h3>
          <div className="space-y-3">
            {pastProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#1E1E1E] border border-[#E8E0D4] dark:border-[#3A3A3A]"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-[#D4CEC7]">
                    {profile.label ?? t("Untitled profile", lang)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-[#6A6460] mt-0.5 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 dark:text-[#A0998E] tabular-nums space-y-0.5">
                  <p>{profile.calorieTarget} kcal</p>
                  <p>
                    <span className="text-[#5A6B4F]">{profile.proteinTarget}g P</span>
                    {" · "}
                    <span className="text-[#B8907A]">{profile.carbsTarget}g C</span>
                    {" · "}
                    <span className="text-[#C4724E]">{profile.fatTarget}g F</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal Plans */}
      <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F1EB] uppercase tracking-wide">
            {t("Meal Plans", lang)}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/clients/${client.id}/plans/new`)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("New Plan", lang)}
          </Button>
        </div>

        {plans.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-[#6A6460]">{t("No meal plans yet", lang)}</p>
        ) : (
          <div className="space-y-2">
            {plans.map((plan) => (
              <a
                key={plan.id}
                href={`/clients/${client.id}/plans/${plan.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E8E0D4] dark:border-[#3A3A3A] bg-slate-50 dark:bg-[#1E1E1E] hover:bg-slate-100 dark:hover:bg-[#2A2A2A] transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-[#E8E2DA] group-hover:text-slate-900 dark:group-hover:text-[#F5F1EB]">
                    {plan.title ?? t("Untitled Plan", lang)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-[#6A6460] mt-0.5 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(plan.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    –{" "}
                    {new Date(plan.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border",
                      PLAN_STATUS_STYLES[plan.status] ?? PLAN_STATUS_STYLES.draft
                    )}
                  >
                    {tStatus(plan.status, lang)}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-slate-400 dark:text-[#6A6460]" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
