import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ClientListClient } from "@/components/clients/client-list-client";

export const metadata = { title: "Clients — MacroChef" };

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clients = await db.client.findMany({
    where: { coachId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      targetProfiles: {
        where: { isActive: true },
        take: 1,
      },
    },
  });

  const clientItems = clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    status: c.status as string,
    activeProfile: c.targetProfiles[0]
      ? {
          label: c.targetProfiles[0].label,
          calorieTarget: c.targetProfiles[0].calorieTarget,
          proteinTarget: c.targetProfiles[0].proteinTarget,
          carbsTarget: c.targetProfiles[0].carbsTarget,
          fatTarget: c.targetProfiles[0].fatTarget,
        }
      : null,
  }));

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your clients and their macro targets
        </p>
      </div>
      <ClientListClient clients={clientItems} />
    </div>
  );
}
