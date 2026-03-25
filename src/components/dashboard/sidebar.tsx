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
import { Button } from "@/components/ui/button";
import { LANG_COOKIE, type Lang } from "@/lib/language-client";
import { t, type TranslationKey } from "@/lib/translations";

const navItems: { href: string; key: TranslationKey; icon: React.ElementType }[] = [
  { href: "/dashboard",   key: "Dashboard",   icon: LayoutDashboard },
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
    <aside className="flex h-full w-60 flex-col bg-slate-900 text-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
          <ChefHat className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white">MacroChef</span>
      </div>

      {/* Coach info */}
      <div className="px-5 py-4 border-b border-slate-800">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Coach</p>
        <p className="text-sm font-medium text-slate-100 truncate">{userName}</p>
        {userEmail && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, key, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key, lang)}
            </Link>
          );
        })}
      </nav>

      {/* Language toggle */}
      <div className="px-3 pb-1 border-t border-slate-800 pt-3">
        <button
          onClick={toggleLang}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <span className="text-base leading-none">{lang === "en" ? "🇬🇷" : "🇬🇧"}</span>
          <span>{lang === "en" ? "Ελληνικά" : "English"}</span>
        </button>
      </div>

      {/* Sign out */}
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {t("Sign out", lang)}
        </Button>
      </div>
    </aside>
  );
}
