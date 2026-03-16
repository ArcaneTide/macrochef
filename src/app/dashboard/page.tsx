import Link from "next/link";
import { BookOpen, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userName={session.user.name ?? "Coach"} />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-500 mb-8">Welcome to MacroChef. More features coming soon.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-lg">
          <Link
            href="/ingredients"
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Ingredients</p>
              <p className="text-sm text-slate-500">USDA-verified library</p>
            </div>
          </Link>

          <Link
            href="/recipes"
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Recipes</p>
              <p className="text-sm text-slate-500">Create and manage recipes</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
