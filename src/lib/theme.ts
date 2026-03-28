import { cookies } from "next/headers";

export const THEME_COOKIE = "mc_theme";

export async function getDarkMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(THEME_COOKIE)?.value === "dark";
}
