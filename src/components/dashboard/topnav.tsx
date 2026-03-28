"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Package,
  Settings,
  ChefHat,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LANG_COOKIE, type Lang } from "@/lib/language-client";
import { t, type TranslationKey } from "@/lib/translations";

const navItems: { href: string; key: TranslationKey; icon: React.ElementType }[] = [
  { href: "/home",         key: "Dashboard",    icon: LayoutDashboard },
  { href: "/recipes",      key: "Recipes",      icon: BookOpen },
  { href: "/clients",      key: "Clients",      icon: Users },
  { href: "/ingredients",  key: "Ingredients",  icon: Package },
  { href: "/settings",     key: "Settings",     icon: Settings },
];

interface TopNavProps {
  userName: string;
  lang: Lang;
}

export function TopNav({ userName, lang }: TopNavProps) {
  const pathname = usePathname();

  function toggleLang() {
    const next: Lang = lang === "en" ? "el" : "en";
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-6 gap-6">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-2 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
          <ChefHat className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900">MacroChef</span>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map(({ href, key, icon: Icon }) => {
          const isActive = href === "/home" ? pathname === "/home" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <span>{lang === "en" ? "🇬🇷" : "🇬🇧"}</span>
          <span>{lang === "en" ? "EL" : "EN"}</span>
        </button>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">{userName}</span>
          <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-medium text-emerald-700">Coach</span>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
