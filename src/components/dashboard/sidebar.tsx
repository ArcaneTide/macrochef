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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/ingredients", label: "Ingredients", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();

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
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
