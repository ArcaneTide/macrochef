import { getLang } from "@/lib/language";
import { t } from "@/lib/translations";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();

  return (
    <div className="flex min-h-screen">
      {/* Left branded panel — hidden on mobile */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center px-12 py-16"
        style={{ background: "linear-gradient(135deg, var(--color-olive), var(--color-charcoal))" }}
      >
        {/* Logo inline — white version */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 50 50" fill="none" className="h-12 w-12">
              <circle cx="25" cy="25" r="22" stroke="#2C2C2C" strokeWidth="1.8" opacity="0.15" fill="none"/>
              <circle cx="25" cy="25" r="16" stroke="#2C2C2C" strokeWidth="0.8" opacity="0.08" fill="none"/>
              <path d="M25 9 A16 16 0 0 1 39.5 19.5 L25 25 Z" fill="#7A8B6F" opacity="0.8"/>
              <path d="M39.5 19.5 A16 16 0 0 1 30 40 L25 25 Z" fill="#B8907A" opacity="0.8"/>
              <path d="M30 40 A16 16 0 0 1 10.5 20 L25 25 Z" fill="#C4724E" opacity="0.8"/>
              <path d="M10.5 20 A16 16 0 0 1 25 9 L25 25 Z" fill="#C4B9A8" opacity="0.6"/>
              <circle cx="25" cy="25" r="4" fill="#FDFBF8"/>
            </svg>
            <span className="font-serif text-3xl text-white">Macro<span style={{ color: "#C4724E" }}>Πie</span></span>
          </div>

          <p className="font-tagline italic text-base text-white/80 mt-1">
            {t("Every plate tells a number.", lang)}
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-sm text-white/75 font-sans">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
              {t("auth bullet recipes", lang)}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
              {t("auth bullet portions", lang)}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60 shrink-0" />
              {t("auth bullet share", lang)}
            </li>
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full md:w-1/2 min-h-screen items-center justify-center bg-[var(--color-warm-white)] px-4 py-12">
        {children}
      </div>
    </div>
  );
}
