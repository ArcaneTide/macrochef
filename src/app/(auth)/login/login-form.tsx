"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";
import { t, type Lang } from "@/lib/translations";

function SubmitButton({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#7A8B6F] hover:bg-[#6A7B5F] text-white h-9 rounded-xl font-medium transition-colors"
    >
      {pending ? t("Signing in…", lang) : t("Sign in", lang)}
    </Button>
  );
}

export function LoginForm({ lang }: { lang: Lang }) {
  const [state, action] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-[#1A1A1A] dark:to-[#242424] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A8B6F] text-white">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-[#F5F1EB]">MacroPie</h1>
          <p className="text-sm text-slate-500 dark:text-[#A0998E]">{t("Sign in to your account", lang)}</p>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("Password", lang)}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-slate-500 dark:text-[#A0998E] hover:text-[#B8907A] hover:underline"
                >
                  {t("Forgot password", lang)}
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <SubmitButton lang={lang} />
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-[#A0998E]">
          {t("Don't have an account?", lang)}{" "}
          <Link
            href="/signup"
            className="font-medium text-[#7A8B6F] hover:text-[#6A7B5F] hover:underline"
          >
            {t("Sign up", lang)}
          </Link>
        </p>
      </div>
    </div>
  );
}
