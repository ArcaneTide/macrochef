import { getLang } from "@/lib/language";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const lang = await getLang();
  return <ForgotPasswordForm lang={lang} />;
}
