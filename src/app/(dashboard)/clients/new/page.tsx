import { CreateClientForm } from "@/components/clients/client-form";
import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export const metadata = { title: "New Client — MacroLock" };

export default async function NewClientPage() {
  const lang = await getLang();
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t("New Client", lang)}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("New client description", lang)}</p>
      </div>
      <CreateClientForm lang={lang} />
    </div>
  );
}
