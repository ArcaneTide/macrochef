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
            Macro<span style={{ color: "#C4724E" }}>Πie</span>
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
