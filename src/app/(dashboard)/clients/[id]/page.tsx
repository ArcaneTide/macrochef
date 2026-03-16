import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClientDetail } from "@/components/clients/client-detail";

export const metadata = { title: "Client — MacroChef" };

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await db.client.findUnique({
    where: { id },
    include: {
      targetProfiles: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client || client.coachId !== session.user.id) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm text-slate-400 mb-1">
          <a href="/clients" className="hover:text-slate-600 transition-colors">Clients</a>
          {" / "}
          <span className="text-slate-600">{client.name}</span>
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{client.name}</h1>
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
      />
    </div>
  );
}
