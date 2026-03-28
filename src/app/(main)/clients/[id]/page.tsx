import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClientDetail } from "@/components/clients/client-detail";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "Client — MacroLock" };

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user?.id) redirect("/login");

  const [client, plans] = await Promise.all([
    db.client.findUnique({
      where: { id },
      include: {
        targetProfiles: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.mealPlan.findMany({
      where: { clientId: id },
      orderBy: { startDate: "desc" },
      select: { id: true, title: true, status: true, startDate: true, endDate: true },
    }),
  ]);

  if (!client || client.coachId !== session.user.id) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <nav className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500 mb-1.5">
          <a href="/clients" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{t("Clients", lang)}</a>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">{client.name}</span>
        </nav>
        <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-slate-100">{client.name}</h1>
      </div>
      <ClientDetail
        client={{
          id: client.id,
          name: client.name,
          email: client.email,
          status: client.status as string,
          notes: client.notes,
          createdAt: client.createdAt.toISOString(),
        }}
        profiles={client.targetProfiles.map((p) => ({
          id: p.id,
          label: p.label,
          calorieTarget: p.calorieTarget,
          proteinTarget: p.proteinTarget,
          carbsTarget: p.carbsTarget,
          fatTarget: p.fatTarget,
          isActive: p.isActive,
          createdAt: p.createdAt.toISOString(),
        }))}
        plans={plans.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status as string,
          startDate: p.startDate.toISOString(),
          endDate: p.endDate.toISOString(),
        }))}
        lang={lang}
      />
    </div>
  );
}
