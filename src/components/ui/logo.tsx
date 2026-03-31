export function Logo({ size }: { size: "auth" | "nav" }) {
  if (size === "nav") {
    return (
      <>
        <svg viewBox="0 0 22 22" fill="none" className="h-7 w-7">
          <circle cx="11" cy="11" r="10" stroke="#2C2C2C" strokeWidth="0.8" opacity="0.12" fill="none"/>
          <path d="M11 3.5 A7.5 7.5 0 0 1 17.5 8 L11 11 Z" fill="#7A8B6F" opacity="0.8"/>
          <path d="M17.5 8 A7.5 7.5 0 0 1 13.5 18 L11 11 Z" fill="#B8907A" opacity="0.8"/>
          <path d="M13.5 18 A7.5 7.5 0 0 1 4.5 9 L11 11 Z" fill="#C4724E" opacity="0.8"/>
          <path d="M4.5 9 A7.5 7.5 0 0 1 11 3.5 L11 11 Z" fill="#C4B9A8" opacity="0.5"/>
          <circle cx="11" cy="11" r="2" fill="#FDFBF8"/>
        </svg>
        <span className="text-sm font-semibold" style={{ color: "var(--color-charcoal)" }}>
          Macro<span style={{ color: "var(--color-terracotta)" }}>Πie</span>
        </span>
      </>
    );
  }

  return (
    <>
      <svg viewBox="0 0 50 50" fill="none" className="h-10 w-10">
        <circle cx="25" cy="25" r="22" stroke="#2C2C2C" strokeWidth="1.8" opacity="0.15" fill="none"/>
        <circle cx="25" cy="25" r="16" stroke="#2C2C2C" strokeWidth="0.8" opacity="0.08" fill="none"/>
        <path d="M25 9 A16 16 0 0 1 39.5 19.5 L25 25 Z" fill="#7A8B6F" opacity="0.8"/>
        <path d="M39.5 19.5 A16 16 0 0 1 30 40 L25 25 Z" fill="#B8907A" opacity="0.8"/>
        <path d="M30 40 A16 16 0 0 1 10.5 20 L25 25 Z" fill="#C4724E" opacity="0.8"/>
        <path d="M10.5 20 A16 16 0 0 1 25 9 L25 25 Z" fill="#C4B9A8" opacity="0.6"/>
        <circle cx="25" cy="25" r="4" fill="#FDFBF8"/>
      </svg>
      <h1 className="font-serif text-2xl text-slate-900 dark:text-[#F5F1EB]">
        Macro<span style={{ color: "var(--color-terracotta)" }}>Πie</span>
      </h1>
    </>
  );
}
