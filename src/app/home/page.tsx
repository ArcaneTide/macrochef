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
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLang } from "@/lib/language";
import { t, tStatus } from "@/lib/translations";

export const metadata = { title: "Home — MacroLock" };

// ── helpers ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
  color: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow hover:shadow-md transition-all border-l-4",
        accent
      )}
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
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

export default async function HomePage() {
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
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:flex">
        <Sidebar userName={session.user.name ?? "Coach"} userEmail={session.user.email ?? undefined} lang={lang} />
      </div>

      {/* Mobile top bar + slide-over */}
      <MobileNav userName={session.user.name ?? "Coach"} userEmail={session.user.email ?? undefined} lang={lang} />

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-8 px-6 pb-8 sm:px-8 sm:pb-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-sans font-bold text-slate-900">
              {(() => {
                const hour = new Date().getHours();
                return hour < 5 ? t("Good night", lang) : hour < 12 ? t("Good morning", lang) : hour < 18 ? t("Good afternoon", lang) : hour < 22 ? t("Good evening", lang) : t("Good night", lang);
              })()}, {session.user.name?.split(" ")[0] ?? "Coach"}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {new Date().toLocaleDateString(lang === "el" ? "el-GR" : "en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <Link
              href="/recipes/new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("New Recipe", lang)}
            </Link>
            <Link
              href="/clients/new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
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
            <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{t("Welcome to MacroLock", lang)}</h2>
                  <p className="text-xs text-slate-400">{t("Get started in three steps", lang)}</p>
                </div>
              </div>
              <ol className="divide-y divide-slate-100">
                {steps.map(({ key, label, href, icon: Icon }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        {key}
                      </span>
                      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 ml-auto" />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          );
        })()}

        {/* Stat cards */}
        <p className="text-sm font-semibold text-slate-500 mb-3">Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label={t("Active Clients", lang)}
            value={totalClients}
            icon={Users}
            href="/clients"
            color="bg-blue-50 text-blue-600"
            accent="border-l-blue-400"
          />
          <StatCard
            label={t("Published Recipes", lang)}
            value={totalRecipes}
            icon={BookOpen}
            href="/recipes"
            color="bg-emerald-50 text-emerald-600"
            accent="border-l-emerald-400"
          />
          <StatCard
            label={t("Active Meal Plans", lang)}
            value={totalActivePlans}
            icon={CalendarDays}
            href="/clients"
            color="bg-amber-50 text-amber-600"
            accent="border-l-amber-400"
          />
        </div>

        <p className="text-sm font-semibold text-slate-500 mb-3">Workspace</p>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* Client overview (wider) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">{t("Active Clients", lang)}</h2>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">{activeClients.length}</span>
              </div>
              <Link
                href="/clients"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                {t("View all", lang)}
              </Link>
            </div>

            {activeClients.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-slate-400">{t("No active clients yet", lang)}</p>
                <Link
                  href="/clients/new"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("Add your first client", lang)}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeClients.map((client) => {
                  const profile = client.targetProfiles[0] ?? null;
                  const hasNoPlan = client._count.mealPlans === 0;
                  const initials = client.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <Link
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className={cn(
                        "flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group border-l-2",
                        hasNoPlan ? "border-l-amber-400" : "border-l-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900">{client.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {profile ? (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{profile.calorieTarget} kcal</span>
                            ) : (
                              <span className="text-xs text-slate-400">{t("No target profile", lang)}</span>
                            )}
                            {!hasNoPlan && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">{client._count.mealPlans} {client._count.mealPlans !== 1 ? t("plan plural", lang) : t("plan singular", lang)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasNoPlan && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{t("No plan", lang)}</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent activity (narrower) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">{t("Recent Activity", lang)}</h2>
            </div>

            {activity.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 mx-auto mb-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">{t("Nothing yet", lang)}</p>
                <p className="text-xs text-slate-400 mt-1">{t("Recent activity empty hint", lang)}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activity.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      item.kind === "recipe" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {item.kind === "recipe" ? <BookOpen className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.kind === "recipe" ? item.title : item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium border h-4 px-1.5",
                            item.kind === "recipe"
                              ? (RECIPE_STATUS_STYLES[item.status] ?? RECIPE_STATUS_STYLES.draft)
                              : (CLIENT_STATUS_STYLES[item.status] ?? CLIENT_STATUS_STYLES.active)
                          )}
                        >
                          {tStatus(item.status, lang)}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={item.kind === "recipe" ? `/recipes/${item.id}/edit` : `/clients/${item.id}`}
                      className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {item.kind === "recipe" ? t("Edit", lang) : t("View", lang)}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
