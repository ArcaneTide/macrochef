"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction } from "./actions";
import { t, type Lang } from "@/lib/translations";

function SubmitButton({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#7A8B6F] hover:bg-[#6A7B5F] text-white h-9 rounded-xl font-medium transition-colors"
    >
      {pending ? t("Creating account…", lang) : t("Create account", lang)}
    </Button>
  );
}

export function SignupForm({ lang }: { lang: Lang }) {
  const [state, action] = useActionState(signupAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#F9F5EF] to-[#FDFBF8] dark:from-[#1A1A1A] dark:to-[#242424] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10">
            <circle cx="12" cy="12" r="10" fill="#7A8B6F"/>
            <path d="M12 2a10 10 0 0 1 8.66 5L12 12V2z" fill="#B8907A"/>
            <path d="M20.66 7A10 10 0 0 1 12 22V12l8.66-5z" fill="#C4724E"/>
            <path d="M12 22A10 10 0 0 1 3.34 7L12 12v10z" fill="#E8E0D4"/>
            <circle cx="12" cy="12" r="1.5" fill="white"/>
          </svg>
          <h1 className="font-serif text-2xl text-slate-900 dark:text-[#F5F1EB]">
            MacroΠ<span style={{ color: "#C4724E" }}>ie</span>
          </h1>
          <p className="text-sm text-[#4A4A4A] dark:text-[#A0998E]">{t("Create your coach account", lang)}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow">
          <form action={action} className="flex flex-col gap-4">
            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {state.error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{t("Full name", lang)}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Alex Smith"
                autoComplete="name"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t("Email", lang)}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t("Password", lang)}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            <SubmitButton lang={lang} />
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[#4A4A4A] dark:text-[#A0998E]">
          {t("Already have an account?", lang)}{" "}
          <Link href="/login" className="font-medium text-[#B8907A] hover:underline">
            {t("Sign in", lang)}
          </Link>
        </p>
      </div>
    </div>
  );
}
