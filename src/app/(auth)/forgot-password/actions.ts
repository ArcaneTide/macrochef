"use server";

import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function forgotPasswordAction(
  _prevState: { message?: string; error?: string } | null,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;

  // Always return the same message to prevent user enumeration
  const successMessage = "If an account exists for that email, a reset link has been sent.";

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { message: successMessage };

    // Delete any existing tokens for this user
    await db.passwordReset.deleteMany({ where: { userId: user.id } });

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    // TODO: send email — for now log to console
    const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    console.log("\n[MacroLock] Password reset link for", email, ":\n", resetUrl, "\n");

    return { message: successMessage };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
