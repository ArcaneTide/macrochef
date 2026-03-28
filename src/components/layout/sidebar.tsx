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
  Lock,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LANG_COOKIE, type Lang } from "@/lib/language-client";
import { t, type TranslationKey } from "@/lib/translations";

const navItems: { href: string; key: TranslationKey; icon: React.ElementType }[] = [
  { href: "/home",        key: "Home",        icon: LayoutDashboard },
  { href: "/recipes",     key: "Recipes",     icon: BookOpen },
  { href: "/clients",     key: "Clients",     icon: Users },
  { href: "/ingredients", key: "Ingredients", icon: Package },
  { href: "/settings",    key: "Settings",    icon: Settings },
];

interface SidebarProps {
  userName: string;
  userEmail?: string;
  lang: Lang;
  onClose?: () => void;
}

export function Sidebar({ userName, userEmail, lang, onClose }: SidebarProps) {
  const pathname = usePathname();

  function toggleLang() {
    const next: Lang = lang === "en" ? "el" : "en";
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  return (
    <aside className="flex h-full w-60 flex-col bg-slate-950 text-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800 shadow-[0_1px_0_0_rgba(16,185,129,0.15)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 shadow-sm">
          <Lock className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white">MacroLock</span>
      </div>

      {/* Coach info */}
      <div className="px-5 py-4 border-b border-slate-800">
        <p className="text-base font-semibold text-white truncate">{userName}</p>
        <span className="rounded-full bg-emerald-600/30 px-2 py-0.5 text-xs font-medium text-emerald-400">Coach</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, key, icon: Icon }) => {
          const isActive =
            href === "/home"
              ? pathname === "/home"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key, lang)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
        <button
          onClick={toggleLang}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <span className="text-base leading-none">{lang === "en" ? "🇬🇷" : "🇬🇧"}</span>
          <span>{lang === "en" ? "Ελληνικά" : "English"}</span>
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {t("Sign out", lang)}
        </button>
      </div>
    </aside>
  );
}
