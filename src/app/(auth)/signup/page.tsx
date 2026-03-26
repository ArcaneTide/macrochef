import { getLang } from "@/lib/language";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const lang = await getLang();
  return <SignupForm lang={lang} />;
}
