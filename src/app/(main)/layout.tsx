import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/dashboard/topnav";
import { getLang } from "@/lib/language";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-warm-white)" }}>
      <TopNav
        userName={session.user.name ?? "Coach"}
        userEmail={session.user.email ?? undefined}
        lang={lang}
      />
      <main className="px-4 md:px-8 pb-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
