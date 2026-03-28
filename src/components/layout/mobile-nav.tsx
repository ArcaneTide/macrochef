"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Lock } from "lucide-react";
import { Sidebar } from "./sidebar";
import type { Lang } from "@/lib/language-client";

interface MobileNavProps {
  userName: string;
  userEmail?: string;
  lang: Lang;
}

export function MobileNav({ userName, userEmail, lang }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close overlay on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Fixed top header — only visible on mobile (below lg) */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600">
            <Lock className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900">MacroLock</span>
        </div>
        <span className="flex-1 text-sm text-slate-500 truncate mx-4">{userName}</span>
        <button
          onClick={() => setOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Slide-over sidebar */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 shadow-xl">
            <Sidebar
              userName={userName}
              userEmail={userEmail}
              lang={lang}
              onClose={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
