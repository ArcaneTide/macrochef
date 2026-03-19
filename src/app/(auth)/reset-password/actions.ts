"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  token: z.string().min(1, "Reset token is missing."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export async function resetPasswordAction(
  _prevState: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { token, password } = parsed.data;

  try {
    const reset = await db.passwordReset.findUnique({
      where: { token },
      include: { user: { select: { id: true } } },
    });

    if (!reset) return { error: "Invalid or expired reset link." };
    if (reset.expiresAt < new Date()) {
      await db.passwordReset.delete({ where: { token } });
      return { error: "This reset link has expired. Please request a new one." };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.$transaction([
      db.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      db.passwordReset.deleteMany({ where: { userId: reset.userId } }),
    ]);

    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
