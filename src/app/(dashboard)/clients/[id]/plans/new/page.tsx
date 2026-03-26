import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreatePlanForm } from "@/components/meal-plans/create-plan-form";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "New Meal Plan — MacroChef" };

export default async function NewPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user?.id) redirect("/login");

  const client = await db.client.findUnique({
    where: { id },
    select: { id: true, name: true, coachId: true },
  });

  if (!client || client.coachId !== session.user.id) notFound();

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm text-slate-400 mb-1">
          <a href="/clients" className="hover:text-slate-600 transition-colors">{t("Clients", lang)}</a>
          {" / "}
          <a href={`/clients/${id}`} className="hover:text-slate-600 transition-colors">
            {client.name}
          </a>
          {" / "}
          <span className="text-slate-600">{t("New Plan", lang)}</span>
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{t("New Meal Plan", lang)}</h1>
        <p className="text-slate-500 text-sm mt-1">
          Create a weekly plan for {client.name}
        </p>
      </div>
      <CreatePlanForm clientId={id} lang={lang} />
    </div>
  );
}
