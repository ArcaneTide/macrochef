"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Lock } from "lucide-react";
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
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-xl font-medium transition-colors"
    >
      {pending ? t("Creating account…", lang) : t("Create account", lang)}
    </Button>
  );
}

export function SignupForm({ lang }: { lang: Lang }) {
  const [state, action] = useActionState(signupAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">MacroLock</h1>
          <p className="text-sm text-slate-500">{t("Create your coach account", lang)}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
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

        <p className="mt-4 text-center text-sm text-slate-500">
          {t("Already have an account?", lang)}{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {t("Sign in", lang)}
          </Link>
        </p>
      </div>
    </div>
  );
}
