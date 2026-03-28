"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Package,
  Settings,
  ChefHat,
  LogOut,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LANG_COOKIE, type Lang } from "@/lib/language-client";
import { t, type TranslationKey } from "@/lib/translations";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
];

const navItems: { href: string; key: TranslationKey; icon: React.ElementType }[] = [
  { href: "/home",        key: "Home",        icon: LayoutDashboard },
  { href: "/recipes",     key: "Recipes",     icon: BookOpen },
  { href: "/clients",     key: "Clients",     icon: Users },
  { href: "/ingredients", key: "Ingredients", icon: Package },
  { href: "/settings",    key: "Settings",    icon: Settings },
];

interface TopNavProps {
  userName: string;
  lang: Lang;
}

export function TopNav({ userName, lang }: TopNavProps) {
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  function selectLang(code: Lang) {
    setLangOpen(false);
    if (code === lang) return;
    document.cookie = `${LANG_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const initials = userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const firstName = userName.split(" ")[0];

  return (
    <header className="flex h-14 items-center rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-md shadow-black/8 border border-slate-200/80 dark:border-slate-700/50 px-5 gap-6">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-sm shadow-emerald-500/40">
          <ChefHat className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white">MacroChef</span>
      </Link>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />

      {/* Nav */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map(({ href, key, icon: Icon }) => {
          const isActive = href === "/home" ? pathname === "/home" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key, lang)}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Language */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all duration-150"
          >
            <span>{currentLang.flag}</span>
            <span>{currentLang.label}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-150", langOpen && "rotate-180")} />
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-20 min-w-[170px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1 overflow-hidden">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => selectLang(l.code)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>{l.flag}</span>
                    <span className={cn("flex-1 text-left", l.code === lang ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400")}>{l.label}</span>
                    {l.code === lang && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Theme toggle */}
        <ThemeToggle />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{firstName}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-150", profileOpen && "rotate-180")} />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-20 w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{userName}</p>
                    <span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Coach</span>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    {t("Settings", lang)}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("Sign out", lang)}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
