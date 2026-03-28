import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/layout/topnav";
import { getLang } from "@/lib/language";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, lang] = await Promise.all([auth(), getLang()]);
  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950">
      <div className="shrink-0 px-4 pt-3">
        <TopNav userName={session.user.name ?? "Coach"} lang={lang} />
      </div>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
