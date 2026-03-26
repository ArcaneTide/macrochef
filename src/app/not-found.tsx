import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export default async function NotFound() {
  const lang = await getLang();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <p className="text-xl font-semibold text-slate-800 mb-2">{t("Page not found", lang)}</p>
        <p className="text-slate-500 mb-8">{t("Page not found description", lang)}</p>
        <Button asChild>
          <Link href="/dashboard">{t("Go to Dashboard", lang)}</Link>
        </Button>
      </div>
    </div>
  );
}
