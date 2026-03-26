"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LANG_COOKIE, type Lang } from "@/lib/language-client";
import { t } from "@/lib/translations";

function getLangFromCookie(): Lang {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
  return m?.[1] === "el" ? "el" : "en";
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    console.error(error);
    setLang(getLangFromCookie());
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">{t("Something went wrong", lang)}</h1>
        <p className="text-slate-500 mb-6">{t("Error description", lang)}</p>
        <Button onClick={reset}>{t("Try again", lang)}</Button>
      </div>
    </div>
  );
}
