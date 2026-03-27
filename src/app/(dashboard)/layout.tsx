import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
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
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:flex">
        <Sidebar
          userName={session.user.name ?? "Coach"}
          userEmail={session.user.email ?? undefined}
          lang={lang}
        />
      </div>

      {/* Mobile top bar + slide-over */}
      <MobileNav
        userName={session.user.name ?? "Coach"}
        userEmail={session.user.email ?? undefined}
        lang={lang}
      />

      {/* Main — top padding on mobile to clear the fixed header */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-8">{children}</main>
    </div>
  );
}
