import { cookies } from "next/headers";
import type { Lang } from "./translations";

export const LANG_COOKIE = "mc_lang";

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const val = cookieStore.get(LANG_COOKIE)?.value;
  return val === "el" ? "el" : "en";
}
