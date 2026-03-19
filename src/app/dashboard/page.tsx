import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  BookOpen,
  CalendarDays,
  Plus,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "Dashboard — MacroChef" };

// ── helpers ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Link>
  );
}

const PLAN_STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-400 border-slate-200",
};

// ── page ─────────────────────────────────────────────────

export default async function DashboardPage() {
  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user?.id) redirect("/login");

  const coachId = session.user.id;

  const [
    totalClients,
    totalRecipes,
    totalActivePlans,
    anyRecipes,
    anyClients,
    anyPlans,
    recentRecipes,
    recentClients,
    activeClients,
  ] = await Promise.all([
    db.client.count({ where: { coachId, status: "active" } }),
    db.recipe.count({ where: { userId: coachId, status: "published" } }),
    db.mealPlan.count({
      where: { status: "active", client: { coachId } },
    }),
    db.recipe.count({ where: { userId: coachId } }),
    db.client.count({ where: { coachId } }),
    db.mealPlan.count({ where: { client: { coachId } } }),
    db.recipe.findMany({
      where: { userId: coachId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    db.client.findMany({
      where: { coachId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, status: true, createdAt: true },
    }),
    db.client.findMany({
      where: { coachId, status: "active" },
      orderBy: { name: "asc" },
      include: {
        targetProfiles: { where: { isActive: true }, take: 1 },
        _count: { select: { mealPlans: true } },
      },
    }),
  ]);

  // Merge + sort recent activity
  type ActivityItem =
    | { kind: "recipe"; id: string; title: string; status: string; date: Date }
    | { kind: "client"; id: string; name: string; status: string; date: Date };

  const activity: ActivityItem[] = [
    ...recentRecipes.map((r) => ({
      kind: "recipe" as const,
      id: r.id,
      title: r.title,
      status: r.status as string,
      date: r.createdAt,
    })),
    ...recentClients.map((c) => ({
      kind: "client" as const,
      id: c.id,
      name: c.name,
      status: c.status as string,
      date: c.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const RECIPE_STATUS_STYLES: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700 border-emerald-200",
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    archived: "bg-slate-100 text-slate-400 border-slate-200",
  };
  const CLIENT_STATUS_STYLES: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    archived: "bg-slate-100 text-slate-400 border-slate-200",
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userName={session.user.name ?? "Coach"} userEmail={session.user.email ?? undefined} lang={lang} />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{t("Dashboard", lang)}</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {anyRecipes === 0 && anyClients === 0
                ? t("Welcome", lang)
                : t("Welcome back", lang)
              }, {session.user.name?.split(" ")[0] ?? "Coach"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/recipes/new"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("New Recipe", lang)}
            </Link>
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("New Client", lang)}
            </Link>
          </div>
        </div>

        {/* Onboarding card — hides each step as it's completed, hides entirely when all done */}
        {(anyRecipes === 0 || anyClients === 0 || anyPlans === 0) && (() => {
          const steps = [
            { key: 1, done: anyRecipes > 0, label: t("Create your first recipe", lang), href: "/recipes/new", icon: BookOpen },
            { key: 2, done: anyClients > 0, label: t("Add a client", lang), href: "/clients/new", icon: Users },
            { key: 3, done: anyPlans > 0,   label: t("Build a weekly meal plan", lang), href: "/clients", icon: CalendarDays },
          ].filter((s) => !s.done);
          if (steps.length === 0) return null;
          return (
            <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-emerald-900">{t("Welcome to MacroChef", lang)}</h2>
                  <p className="text-sm text-emerald-700">{t("Get started in three steps", lang)}</p>
                </div>
              </div>
              <ol className="space-y-3">
                {steps.map(({ key, label, href, icon: Icon }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        {key}
                      </span>
                      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          );
        })()}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label={t("Active Clients", lang)}
            value={totalClients}
            icon={Users}
            href="/clients"
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label={t("Published Recipes", lang)}
            value={totalRecipes}
            icon={BookOpen}
            href="/recipes"
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label={t("Active Meal Plans", lang)}
            value={totalActivePlans}
            icon={CalendarDays}
            href="/clients"
            color="bg-amber-50 text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Client overview (wider) */}
          <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                {t("Active Clients", lang)}
              </h2>
              <Link
                href="/clients"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                View all
              </Link>
            </div>

            {activeClients.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-slate-400">No active clients yet.</p>
                <Link
                  href="/clients/new"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add your first client
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeClients.map((client) => {
                  const profile = client.targetProfiles[0] ?? null;
                  return (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                          {client.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {profile
                            ? `${profile.calorieTarget} kcal target`
                            : "No target profile"}
                          {client._count.mealPlans > 0 && (
                            <span className="ml-2 text-slate-300">·</span>
                          )}
                          {client._count.mealPlans > 0 && (
                            <span className="ml-2">
                              {client._count.mealPlans} plan
                              {client._count.mealPlans !== 1 ? "s" : ""}
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent activity (narrower) */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                {t("Recent Activity", lang)}
              </h2>
            </div>

            {activity.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-slate-400">Nothing yet. Start by adding a recipe or client.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activity.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.kind === "recipe" ? `/recipes/${item.id}/edit` : `/clients/${item.id}`}
                    className="flex items-start gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      item.kind === "recipe" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {item.kind === "recipe" ? (
                        <BookOpen className="h-3.5 w-3.5" />
                      ) : (
                        <Users className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">
                        {item.kind === "recipe" ? item.title : item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium border capitalize h-4 px-1.5",
                            item.kind === "recipe"
                              ? (RECIPE_STATUS_STYLES[item.status] ?? RECIPE_STATUS_STYLES.draft)
                              : (CLIENT_STATUS_STYLES[item.status] ?? CLIENT_STATUS_STYLES.active)
                          )}
                        >
                          {item.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {item.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
