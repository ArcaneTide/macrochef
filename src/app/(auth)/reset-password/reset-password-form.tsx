"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ChefHat, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-lg font-medium transition-colors"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      {pending ? "Resetting…" : "Reset password"}
    </Button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, null);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-3" />
            <p className="text-sm text-slate-700 mb-4">This reset link is invalid or missing.</p>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ChefHat className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">MacroChef</h1>
          <p className="text-sm text-slate-500">Choose a new password</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {state?.success ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <p className="text-sm text-slate-700">Your password has been reset.</p>
              <Link
                href="/login"
                className="mt-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Sign in with your new password
              </Link>
            </div>
          ) : (
            <form action={action} className="flex flex-col gap-4">
              <input type="hidden" name="token" value={token} />

              {state?.error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {state.error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              <SubmitButton />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
