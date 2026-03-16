"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Archive, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EditClientForm, type ClientInitialData } from "@/components/clients/client-form";
import { NewProfileForm } from "@/components/clients/new-profile-form";
import { archiveClient } from "@/app/(dashboard)/clients/actions";

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
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
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
      <span className="text-sm text-slate-500">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", color)}>
        {value}
        <span className="text-xs font-normal ml-0.5 text-slate-400">{unit}</span>
      </span>
    </div>
  );
}

export function ClientDetail({ client, profiles }: ClientDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [isArchiving, startArchiveTransition] = useTransition();

  const activeProfile = profiles.find((p) => p.isActive) ?? null;
  const pastProfiles = profiles.filter((p) => !p.isActive);

  function handleArchive() {
    if (!confirm(`Archive ${client.name}? They will no longer appear in your active clients.`)) return;
    startArchiveTransition(async () => {
      await archiveClient(client.id);
      router.push("/clients");
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Client info card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {isEditing ? (
          <>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-5">
              Edit Client
            </h2>
            <EditClientForm
              initialData={client as ClientInitialData}
              onCancel={() => setIsEditing(false)}
            />
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-semibold text-slate-900">{client.name}</h2>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium border capitalize",
                      STATUS_STYLES[client.status] ?? STATUS_STYLES.active
                    )}
                  >
                    {client.status}
                  </Badge>
                </div>
                {client.email && (
                  <p className="text-sm text-slate-500 mt-0.5">{client.email}</p>
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
                  Edit
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
                    Archive
                  </Button>
                )}
              </div>
            </div>
            {client.notes && (
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">
                {client.notes}
              </p>
            )}
          </>
        )}
      </div>

      {/* Active target profile */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Active Macro Targets
            </h3>
            {activeProfile?.label && (
              <p className="text-xs text-emerald-600 font-medium mt-0.5">{activeProfile.label}</p>
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
              New Profile
            </Button>
          )}
        </div>

        {isAddingProfile ? (
          <NewProfileForm
            clientId={client.id}
            onCancel={() => setIsAddingProfile(false)}
          />
        ) : activeProfile ? (
          <div className="divide-y divide-slate-100">
            <MacroRow label="Calories" value={activeProfile.calorieTarget} unit="kcal" color="text-slate-900" />
            <MacroRow label="Protein" value={activeProfile.proteinTarget} unit="g" color="text-blue-600" />
            <MacroRow label="Carbs" value={activeProfile.carbsTarget} unit="g" color="text-amber-600" />
            <MacroRow label="Fat" value={activeProfile.fatTarget} unit="g" color="text-orange-600" />
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">
            No active profile. Create one above.
          </p>
        )}
      </div>

      {/* Profile history */}
      {pastProfiles.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
            Profile History
          </h3>
          <div className="space-y-3">
            {pastProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {profile.label ?? "Untitled profile"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 tabular-nums space-y-0.5">
                  <p>{profile.calorieTarget} kcal</p>
                  <p>
                    <span className="text-blue-500">{profile.proteinTarget}g P</span>
                    {" · "}
                    <span className="text-amber-500">{profile.carbsTarget}g C</span>
                    {" · "}
                    <span className="text-orange-500">{profile.fatTarget}g F</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal plans placeholder */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">
          Meal Plans
        </h3>
        <p className="text-sm text-slate-400">No meal plans yet.</p>
      </div>
    </div>
  );
}
