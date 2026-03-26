import { getLang } from "@/lib/language";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ token }, lang] = await Promise.all([searchParams, getLang()]);
  return <ResetPasswordForm token={token ?? ""} lang={lang} />;
}
