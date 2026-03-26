import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "Settings — MacroChef" };

export default async function SettingsPage() {
  const lang = await getLang();
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">{t("Settings", lang)}</h1>
      <p className="text-slate-500">{t("Settings coming soon", lang)}</p>
    </div>
  );
}
