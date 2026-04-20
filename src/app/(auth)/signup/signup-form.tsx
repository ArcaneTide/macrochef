"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { PasswordInput } from "@/components/ui/password-input";
import { signupAction } from "./actions";
import { t, type Lang } from "@/lib/translations";

function SubmitButton({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[var(--color-olive)] hover:bg-[#6A7B5F] text-white h-9 rounded-xl font-medium transition-colors"
    >
      {pending ? t("Creating account…", lang) : t("Create account", lang)}
    </Button>
  );
}

export function SignupForm({ lang }: { lang: Lang }) {
  const [state, action] = useActionState(signupAction, null);

  return (
    <div className="w-full max-w-sm">
      {/* Logo — mobile only */}
      <div className="mb-8 flex flex-col items-center gap-3 md:hidden">
        <Logo size="auth" />
        <p className="text-sm" style={{ color: "var(--color-charcoal-soft)" }}>{t("Create your coach account", lang)}</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[var(--color-sand)] bg-white dark:bg-[#242424] p-6 shadow">
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
            <PasswordInput
              id="password"
              name="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <SubmitButton lang={lang} />
        </form>
      </div>

      <p className="mt-4 text-center text-sm" style={{ color: "var(--color-charcoal-soft)" }}>
        {t("Already have an account?", lang)}{" "}
        <Link href="/login" className="font-medium text-[var(--color-clay)] hover:underline">
          {t("Sign in", lang)}
        </Link>
      </p>
    </div>
  );
}
