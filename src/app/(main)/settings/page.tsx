import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "Settings — MacroΠie" };

export default async function SettingsPage() {
  const lang = await getLang();
  return (
    <div className="py-5 sm:py-6">
      <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-[#F5F1EB] mb-2">{t("Settings", lang)}</h1>
      <p className="text-slate-500 dark:text-[#A0998E]">{t("Settings coming soon", lang)}</p>
    </div>
  );
}
