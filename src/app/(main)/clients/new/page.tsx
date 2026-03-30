import { CreateClientForm } from "@/components/clients/client-form";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "New Client — MacroΠie" };

export default async function NewClientPage() {
  const lang = await getLang();
  return (
    <div className="py-5 sm:py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-sans font-bold text-slate-900 dark:text-[#F5F1EB]">{t("New Client", lang)}</h1>
        <p className="text-slate-500 dark:text-[#A0998E] text-sm mt-1">{t("New client description", lang)}</p>
      </div>
      <CreateClientForm lang={lang} />
    </div>
  );
}
