import { CreateClientForm } from "@/components/clients/client-form";

export const metadata = { title: "New Client — MacroChef" };

export default function NewClientPage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">New Client</h1>
        <p className="text-slate-500 text-sm mt-1">Add a client and set their initial macro targets</p>
      </div>
      <CreateClientForm />
    </div>
  );
}
