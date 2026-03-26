import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calcRecipeMacrosPerServing } from "@/lib/macros";
import { WeeklyPlanEditor } from "@/components/meal-plans/weekly-plan-editor";
import { PlanStatusBar } from "@/components/meal-plans/plan-status-bar";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "Meal Plan — MacroChef" };

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string; planId: string }>;
}) {
  const { id, planId } = await params;

  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user?.id) redirect("/login");

  const plan = await db.mealPlan.findUnique({
    where: { id: planId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          coachId: true,
          targetProfiles: {
            where: { isActive: true },
            take: 1,
          },
        },
      },
      mealAssignments: {
        include: {
          recipe: {
            include: {
              ingredients: { include: { ingredient: true } },
            },
          },
        },
        orderBy: [{ dayIndex: "asc" }, { mealSlot: "asc" }],
      },
    },
  });

  if (!plan || plan.client.coachId !== session.user.id || plan.client.id !== id) {
    notFound();
  }

  // Fetch published recipes for the assign modal
  const recipes = await db.recipe.findMany({
    where: { userId: session.user.id, status: "published" },
    include: { ingredients: { include: { ingredient: true } } },
    orderBy: { title: "asc" },
  });

  const recipeOptions = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    servings: r.servings,
    macrosPerServing: calcRecipeMacrosPerServing(
      r.ingredients.map((ri) => ({ ingredient: ri.ingredient, quantityGrams: ri.quantityGrams })),
      r.servings
    ),
  }));

  const assignments = plan.mealAssignments.map((a) => ({
    id: a.id,
    dayIndex: a.dayIndex,
    mealSlot: a.mealSlot as string,
    servings: a.servings,
    recipe: {
      id: a.recipe.id,
      title: a.recipe.title,
      macrosPerServing: calcRecipeMacrosPerServing(
        a.recipe.ingredients.map((ri) => ({
          ingredient: ri.ingredient,
          quantityGrams: ri.quantityGrams,
        })),
        a.recipe.servings
      ),
    },
  }));

  const activeProfile = plan.client.targetProfiles[0] ?? null;

  const startDate = plan.startDate.toISOString().slice(0, 10);
  const endDate = plan.endDate.toISOString().slice(0, 10);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm text-slate-400 mb-1">
          <a href="/clients" className="hover:text-slate-600 transition-colors">{t("Clients", lang)}</a>
          {" / "}
          <a href={`/clients/${id}`} className="hover:text-slate-600 transition-colors">
            {plan.client.name}
          </a>
          {" / "}
          <span className="text-slate-600">{plan.title ?? t("Meal Plan", lang)}</span>
        </p>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {plan.title ?? t("Meal Plan", lang)}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {new Date(startDate + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              –{" "}
              {new Date(endDate + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {activeProfile && (
                <span className="ml-2 text-slate-400">
                  · {t("Target:", lang)} {activeProfile.calorieTarget} kcal
                </span>
              )}
            </p>
          </div>
          <PlanStatusBar
            planId={planId}
            clientId={id}
            currentStatus={plan.status as "draft" | "active" | "archived"}
            lang={lang}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <WeeklyPlanEditor
            planId={planId}
            initialAssignments={assignments}
            recipes={recipeOptions}
            targetMacros={
              activeProfile
                ? {
                    calorieTarget: activeProfile.calorieTarget,
                    proteinTarget: activeProfile.proteinTarget,
                    carbsTarget: activeProfile.carbsTarget,
                    fatTarget: activeProfile.fatTarget,
                  }
                : null
            }
            startDate={startDate}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
