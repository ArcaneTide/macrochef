"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "./actions";
import { t, type Lang } from "@/lib/translations";

function SubmitButton({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#7A8B6F] hover:bg-[#6A7B5F] text-white h-9 rounded-xl font-medium transition-colors"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      {pending ? t("Sending…", lang) : t("Send reset link", lang)}
    </Button>
  );
}

export function ForgotPasswordForm({ lang }: { lang: Lang }) {
  const [state, action] = useActionState(forgotPasswordAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-[#1A1A1A] dark:to-[#242424] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A8B6F] text-white">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-[#F5F1EB]">MacroΠie</h1>
          <p className="text-sm text-slate-500 dark:text-[#A0998E]">{t("Reset password", lang)}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E8E0D4] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-6 shadow">
          {state?.message ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="h-8 w-8 text-[#7A8B6F]" />
              <p className="text-sm text-slate-700 dark:text-[#F5F1EB]">{state.message}</p>
              <Link
                href="/login"
                className="mt-1 text-sm font-medium text-[#7A8B6F] hover:text-[#6A7B5F] hover:underline"
              >
                {t("Back to sign in", lang)}
              </Link>
            </div>
          ) : (
            <form action={action} className="flex flex-col gap-4">
              {state?.error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {state.error}
                </div>
              )}
              <p className="text-sm text-slate-500 dark:text-[#A0998E]">
                {t("Enter your email for reset", lang)}
              </p>
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
              <SubmitButton lang={lang} />
            </form>
          )}
        </div>

        {!state?.message && (
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-[#A0998E]">
            {t("Remember your password?", lang)}{" "}
            <Link
              href="/login"
              className="font-medium text-[#7A8B6F] hover:text-[#6A7B5F] hover:underline"
            >
              {t("Sign in", lang)}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
