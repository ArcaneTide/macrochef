import { getLang } from "@/lib/language";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const lang = await getLang();
  return <LoginForm lang={lang} />;
}
