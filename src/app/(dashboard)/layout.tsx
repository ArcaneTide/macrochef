import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getLang } from "@/lib/language";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        userName={session.user.name ?? "Coach"}
        userEmail={session.user.email ?? undefined}
        lang={lang}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
