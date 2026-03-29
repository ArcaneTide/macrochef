import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  BookOpen,
  CalendarDays,
  Plus,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLang } from "@/lib/language";
import { t, tStatus } from "@/lib/translations";

export const metadata = { title: "Home — MacroLock" };

function getGreetingKey(hour: number): "Good morning" | "Good afternoon" | "Good evening" | "Good night" {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border bg-white dark:bg-[#242424] p-5 shadow-sm hover:shadow-md transition-all group"
      style={{ borderColor: "var(--color-sand)" }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ background: iconBg }}
      >
        <Icon className="h-6 w-6" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-3xl font-bold tabular-nums" style={{ color: "var(--color-charcoal)" }}>
          {value}
        </p>
        <p className="text-sm" style={{ color: "var(--color-charcoal-soft)" }}>
          {label}
        </p>
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--color-clay)" }}
      />
    </Link>
  );
}

const RECIPE_STATUS_STYLES: Record<string, string> = {
  published: "bg-[#EDF1EB] text-[#7A8B6F] border-[#c5d0bf]",
  draft: "bg-[#E8E0D4] text-[#7a6f65] border-[#d4c8bc]",
  archived: "bg-slate-100 text-slate-400 border-slate-200",
};
const CLIENT_STATUS_STYLES: Record<string, string> = {
  active: "bg-[#EDF1EB] text-[#7A8B6F] border-[#c5d0bf]",
  archived: "bg-slate-100 text-slate-400 border-slate-200",
};

type ActivityItem =
  | { kind: "recipe"; id: string; title: string; status: string; date: Date }
  | { kind: "client"; id: string; name: string; status: string; date: Date };

function ActivityGroup({ items, lang }: { items: ActivityItem[]; lang: import("@/lib/translations").Lang }) {
  return (
    <div className="divide-y" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>
      {items.map((item, idx) => (
        <Link
          key={idx}
          href={item.kind === "recipe" ? `/recipes/${item.id}/edit` : `/clients/${item.id}`}
          className="flex items-start gap-3 px-6 py-3 transition-colors hover:bg-[#FDFBF8] dark:hover:bg-[#2A2A2A] group"
        >
          <div
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: item.kind === "recipe" ? "var(--color-olive-light)" : "var(--color-clay-light)",
              color: item.kind === "recipe" ? "var(--color-olive)" : "var(--color-clay)",
            }}
          >
            {item.kind === "recipe" ? (
              <BookOpen className="h-3.5 w-3.5" />
            ) : (
              <Users className="h-3.5 w-3.5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" style={{ color: "var(--color-charcoal)" }}>
              {item.kind === "recipe" ? item.title : item.name}
            </p>
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
              <span className="text-xs" style={{ color: "var(--color-charcoal-soft)" }}>
                {item.date.toLocaleDateString(lang === "el" ? "el-GR" : "en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user?.id) redirect("/login");

  const coachId = session.user.id;
  const now = new Date();
  const hour = now.getHours();
  const greetingKey = getGreetingKey(hour);

  const dateLabel = now.toLocaleDateString(lang === "el" ? "el-GR" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
    db.mealPlan.count({ where: { status: "active", client: { coachId } } }),
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
    .slice(0, 6);

  const firstName = session.user.name?.split(" ")[0] ?? "Coach";

  // Split activity into today vs earlier
  const todayStr = now.toDateString();
  const todayItems = activity.filter((a) => a.date.toDateString() === todayStr);
  const earlierItems = activity.filter((a) => a.date.toDateString() !== todayStr);

  return (
    <div className="py-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-charcoal)" }}>
            {t(greetingKey, lang)}, {firstName}
          </h1>
          <p className="text-sm mt-0.5 capitalize" style={{ color: "var(--color-charcoal-soft)" }}>
            {dateLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/recipes/new"
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90"
            style={{ background: "var(--color-olive)" }}
          >
            <Plus className="h-4 w-4" />
            {t("New Recipe", lang)}
          </Link>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90"
            style={{ background: "var(--color-clay)" }}
          >
            <Plus className="h-4 w-4" />
            {t("New Client", lang)}
          </Link>
        </div>
      </div>

      {/* Onboarding card */}
      {(anyRecipes === 0 || anyClients === 0 || anyPlans === 0) && (() => {
        const steps = [
          { key: 1, done: anyRecipes > 0, label: t("Create your first recipe", lang), href: "/recipes/new", icon: BookOpen },
          { key: 2, done: anyClients > 0, label: t("Add a client", lang), href: "/clients/new", icon: Users },
          { key: 3, done: anyPlans > 0, label: t("Build a weekly meal plan", lang), href: "/clients", icon: CalendarDays },
        ].filter((s) => !s.done);
        if (steps.length === 0) return null;
        return (
          <div
            className="mb-5 rounded-2xl border p-5"
            style={{ borderColor: "var(--color-clay)", background: "var(--color-clay-light)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "var(--color-clay)" }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold" style={{ color: "var(--color-charcoal)" }}>
                  {t("Welcome to MacroLock", lang)}
                </h2>
                <p className="text-sm" style={{ color: "var(--color-charcoal-soft)" }}>
                  {t("Get started in three steps", lang)}
                </p>
              </div>
            </div>
            <ol className="space-y-3">
              {steps.map(({ key, label, href, icon: Icon }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-xl border bg-white dark:bg-[#2A2A2A] px-4 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md"
                    style={{ borderColor: "var(--color-sand)", color: "var(--color-charcoal)" }}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: "var(--color-clay)" }}
                    >
                      {key}
                    </span>
                    <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--color-charcoal-soft)" }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        );
      })()}

      {/* Overview section */}
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-charcoal-soft)" }}>
        {t("Overview", lang)}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard
          label={t("Active Clients", lang)}
          value={totalClients}
          icon={Users}
          href="/clients"
          iconBg="var(--color-clay-light)"
          iconColor="var(--color-clay)"
        />
        <StatCard
          label={t("Published Recipes", lang)}
          value={totalRecipes}
          icon={BookOpen}
          href="/recipes"
          iconBg="var(--color-olive-light)"
          iconColor="var(--color-olive)"
        />
        <StatCard
          label={t("Active Meal Plans", lang)}
          value={totalActivePlans}
          icon={CalendarDays}
          href="/clients"
          iconBg="#FBF0EB"
          iconColor="#C4724E"
        />
      </div>

      {/* Workspace section */}
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-charcoal-soft)" }}>
        {t("Workspace", lang)}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Active Clients panel */}
        <div className="lg:col-span-3 rounded-2xl border bg-white dark:bg-[#242424] shadow-sm" style={{ borderColor: "var(--color-sand)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-sand)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-charcoal)" }}>
              {t("Active Clients", lang)}
            </h2>
            <Link
              href="/clients"
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: "var(--color-clay)" }}
            >
              {t("View all", lang)}
            </Link>
          </div>

          {activeClients.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm" style={{ color: "var(--color-charcoal-soft)" }}>
                {t("No active clients yet", lang)}
              </p>
              <Link
                href="/clients/new"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                style={{ color: "var(--color-clay)" }}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("Add your first client", lang)}
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>
              {activeClients.map((client) => {
                const profile = client.targetProfiles[0] ?? null;
                const clientInitials = client.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#f5f3ee] dark:hover:bg-[#2A2A2A] group"
                    style={{ borderColor: "var(--color-sand)" }}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold"
                      style={{ background: "var(--color-clay)" }}
                    >
                      {clientInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--color-charcoal)" }}>
                        {client.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-charcoal-soft)" }}>
                        {client._count.mealPlans > 0 ? (
                          <>
                            {client._count.mealPlans}{" "}
                            {client._count.mealPlans !== 1 ? t("plan plural", lang) : t("plan singular", lang)}
                          </>
                        ) : (
                          t("No target profile", lang)
                        )}
                        <span className="mx-1.5" style={{ color: "var(--color-sand)" }}>·</span>
                        {tStatus("active", lang)}
                      </p>
                    </div>
                    {profile && (
                      <span
                        className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--color-clay-light)", color: "var(--color-clay)" }}
                      >
                        {profile.calorieTarget} kcal
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" style={{ color: "var(--color-clay)" }} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity panel */}
        <div className="lg:col-span-2 rounded-2xl border bg-white dark:bg-[#242424] shadow-sm" style={{ borderColor: "var(--color-sand)" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-sand)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-charcoal)" }}>
              {t("Recent Activity", lang)}
            </h2>
          </div>

          {activity.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm" style={{ color: "var(--color-charcoal-soft)" }}>
                {t("Nothing yet", lang)}
              </p>
            </div>
          ) : (
            <>
              {todayItems.length > 0 && (
                <>
                  <p className="px-6 pt-3 pb-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-charcoal-soft)" }}>
                    {t("Today", lang)}
                  </p>
                  <ActivityGroup items={todayItems} lang={lang} />
                </>
              )}
              {earlierItems.length > 0 && (
                <>
                  <p className="px-6 pt-3 pb-1 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-charcoal-soft)" }}>
                    {t("Earlier", lang)}
                  </p>
                  <ActivityGroup items={earlierItems} lang={lang} />
                </>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
