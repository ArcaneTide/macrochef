"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  BookOpen,
  Users,
  Package,
  Settings,
  Lock,
  LogOut,
  Menu,
  X,
  Moon,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LANG_COOKIE, type Lang } from "@/lib/language-client";
import { t, type TranslationKey } from "@/lib/translations";

const navItems: { href: string; key: TranslationKey; icon: React.ElementType }[] = [
  { href: "/home",        key: "Home",        icon: Home },
  { href: "/recipes",     key: "Recipes",     icon: BookOpen },
  { href: "/clients",     key: "Clients",     icon: Users },
  { href: "/ingredients", key: "Ingredients", icon: Package },
  { href: "/settings",    key: "Settings",    icon: Settings },
];

interface TopNavProps {
  userName: string;
  userEmail?: string;
  lang: Lang;
}

export function TopNav({ userName, userEmail, lang }: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Element;
      if (!target.closest("[data-user-menu]")) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  function toggleLang() {
    const next: Lang = lang === "en" ? "el" : "en";
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  }

  function isActive(href: string) {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Top bar */}
      <header
        className="fixed top-0 inset-x-0 z-40 flex h-14 items-center bg-white border-b px-4 md:px-6"
        style={{ borderColor: "var(--color-sand)" }}
      >
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 shrink-0 mr-6">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "var(--color-clay)" }}
          >
            <Lock className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--color-charcoal)" }}>
            MacroLock
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(href)
                  ? "text-[#B8907A] bg-[#F5EDE8]"
                  : "text-[#4A4A4A] hover:bg-[#F5EDE8] hover:text-[#B8907A]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key, lang)}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="hidden md:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-[#F5EDE8]"
            style={{ color: "var(--color-charcoal-soft)" }}
            title={lang === "en" ? "Ελληνικά" : "English"}
          >
            <span className="text-base leading-none">{lang === "en" ? "🇬🇷" : "🇬🇧"}</span>
            <span className="text-xs">{lang === "en" ? "EL" : "EN"}</span>
          </button>

          {/* Dark mode toggle (non-functional) */}
          <button
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#F5EDE8]"
            style={{ color: "var(--color-charcoal-soft)" }}
            title="Dark mode (coming soon)"
            aria-label="Toggle dark mode"
          >
            <Moon className="h-4 w-4" />
          </button>

          {/* User menu */}
          <div className="relative hidden md:block" data-user-menu>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#F5EDE8]"
              data-user-menu
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-semibold"
                style={{ background: "var(--color-clay)" }}
              >
                {initials}
              </div>
              <span className="text-sm font-medium max-w-[120px] truncate" style={{ color: "var(--color-charcoal)" }}>
                {userName.split(" ")[0]}
              </span>
              <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--color-charcoal-soft)" }} />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-56 rounded-xl border bg-white shadow-lg z-50 overflow-hidden"
                style={{ borderColor: "var(--color-sand)" }}
                data-user-menu
              >
                {/* User info */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-sand)" }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold"
                      style={{ background: "var(--color-clay)" }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-charcoal)" }}>
                        {userName}
                      </p>
                      {userEmail && (
                        <p className="text-xs truncate" style={{ color: "var(--color-charcoal-soft)" }}>
                          {userEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ background: "var(--color-olive)" }}
                  >
                    Coach
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-[#F5EDE8]"
                    style={{ color: "var(--color-charcoal-soft)" }}
                  >
                    <Settings className="h-4 w-4" />
                    {t("Settings", lang)}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-[#F5EDE8]"
                    style={{ color: "var(--color-charcoal-soft)" }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("Sign out", lang)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#F5EDE8]"
            style={{ color: "var(--color-charcoal-soft)" }}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/20"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className="md:hidden fixed top-14 inset-x-0 z-40 border-b bg-white shadow-lg"
            style={{ borderColor: "var(--color-sand)" }}
          >
            <nav className="p-3 space-y-1">
              {navItems.map(({ href, key, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(href)
                      ? "text-[#B8907A] bg-[#F5EDE8]"
                      : "text-[#4A4A4A] hover:bg-[#F5EDE8] hover:text-[#B8907A]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(key, lang)}
                </Link>
              ))}
            </nav>

            {/* Mobile bottom actions */}
            <div
              className="border-t px-3 py-3 flex items-center justify-between"
              style={{ borderColor: "var(--color-sand)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-semibold"
                  style={{ background: "var(--color-clay)" }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight" style={{ color: "var(--color-charcoal)" }}>
                    {userName}
                  </p>
                  <span
                    className="text-xs font-medium text-white rounded-full px-1.5 py-0.5"
                    style={{ background: "var(--color-olive)" }}
                  >
                    Coach
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleLang}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition-colors hover:bg-[#F5EDE8]"
                  title={lang === "en" ? "Ελληνικά" : "English"}
                >
                  {lang === "en" ? "🇬🇷" : "🇬🇧"}
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#F5EDE8]"
                  style={{ color: "var(--color-charcoal-soft)" }}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer to push content below fixed topnav */}
      <div className="h-14" />
    </>
  );
}
