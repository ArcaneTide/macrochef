"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ChefHat, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-lg font-medium transition-colors"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      {pending ? t("Sending…", lang) : t("Send reset link", lang)}
    </Button>
  );
}

export function ForgotPasswordForm({ lang }: { lang: Lang }) {
  const [state, action] = useActionState(forgotPasswordAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ChefHat className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">MacroChef</h1>
          <p className="text-sm text-slate-500">{t("Reset password", lang)}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {state?.message ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <p className="text-sm text-slate-700">{state.message}</p>
              <Link
                href="/login"
                className="mt-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
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
              <p className="text-sm text-slate-500">
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
          <p className="mt-4 text-center text-sm text-slate-500">
            {t("Remember your password?", lang)}{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              {t("Sign in", lang)}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
