"use server";

import crypto from "crypto";
import { z } from "zod";
import { Resend } from "resend";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "MacroPie <noreply@macropie.com>",
      to: email,
      subject: "Reset your MacroPie password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h2 style="font-size:20px;font-weight:600;color:#1a1a1a;margin:0 0 8px;">Reset your password</h2>
          <p style="color:#555;margin:0 0 24px;">Click the button below to choose a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#7A8B6F;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">Reset password</a>
          <p style="color:#999;font-size:12px;margin:24px 0 0;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    return { message: successMessage };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
