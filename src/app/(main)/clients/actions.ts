"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export type ActionResult = { success: true; id: string } | { success: false; error: string };

async function getAuthedCoachId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

async function assertClientOwnership(clientId: string, coachId: string) {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { coachId: true },
  });
  if (!client || client.coachId !== coachId) throw new Error("Client not found");
}

// ─── Schemas ──────────────────────────────────────────────

const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().optional(),
  dietType: z.string().max(100, "max 100 characters").optional(),
  excludedFoods: z.string().max(500, "max 500 characters").optional(),
  preferredFoods: z.string().max(500, "max 500 characters").optional(),
  trainingTime: z.enum(["morning", "afternoon", "evening", "none"], {
    error: "must be morning, afternoon, evening, or none",
  }).optional(),
  trainingDays: z.number().int().min(0, "cannot be negative").max(7, "cannot be more than 7").optional(),
  cookingTime: z.enum(["low", "medium", "high"], {
    error: "must be low, medium, or high",
  }).optional(),
  mealPrepFriendly: z.boolean().optional(),
});

const targetProfileSchema = z.object({
  label: z.string().optional(),
  calorieTarget: z.coerce.number().int().min(1, "Calorie target is required"),
  proteinTarget: z.coerce.number().min(0),
  carbsTarget: z.coerce.number().min(0),
  fatTarget: z.coerce.number().min(0),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type TargetProfileInput = z.infer<typeof targetProfileSchema>;

const nullIfEmpty = (s?: string) => s?.trim() || null;

// ─── Actions ──────────────────────────────────────────────

export async function createClient(
  clientData: ClientInput,
  profileData: TargetProfileInput
): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    const client = clientSchema.parse(clientData);
    const profile = targetProfileSchema.parse(profileData);

    const result = await db.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: {
          coachId,
          name: client.name,
          email: client.email || null,
          notes: nullIfEmpty(client.notes),
          dietType: nullIfEmpty(client.dietType),
          excludedFoods: nullIfEmpty(client.excludedFoods),
          preferredFoods: nullIfEmpty(client.preferredFoods),
          trainingTime: client.trainingTime ?? null,
          trainingDays: client.trainingDays ?? null,
          cookingTime: client.cookingTime ?? null,
          mealPrepFriendly: client.mealPrepFriendly ?? null,
        },
      });
      await tx.clientTargetProfile.create({
        data: {
          clientId: newClient.id,
          label: profile.label || null,
          calorieTarget: profile.calorieTarget,
          proteinTarget: profile.proteinTarget,
          carbsTarget: profile.carbsTarget,
          fatTarget: profile.fatTarget,
          isActive: true,
        },
      });
      return newClient;
    });

    revalidatePath("/clients");
    return { success: true, id: result.id };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      console.error("Validation failed:", issues);
      return { success: false, error: `Invalid input: ${issues}` };
    }
    console.error("createClient:", err);
    return { success: false, error: "Failed to create client" };
  }
}

export async function updateClient(id: string, data: ClientInput): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    await assertClientOwnership(id, coachId);
    const parsed = clientSchema.parse(data);

    await db.client.update({
      where: { id },
      data: {
        name: parsed.name,
        email: parsed.email || null,
        notes: nullIfEmpty(parsed.notes),
        dietType: nullIfEmpty(parsed.dietType),
        excludedFoods: nullIfEmpty(parsed.excludedFoods),
        preferredFoods: nullIfEmpty(parsed.preferredFoods),
        trainingTime: parsed.trainingTime ?? null,
        trainingDays: parsed.trainingDays ?? null,
        cookingTime: parsed.cookingTime ?? null,
        mealPrepFriendly: parsed.mealPrepFriendly ?? null,
      },
    });

    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    return { success: true, id };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      console.error("Validation failed:", issues);
      return { success: false, error: `Invalid input: ${issues}` };
    }
    console.error("updateClient:", err);
    return { success: false, error: "Failed to update client" };
  }
}

export async function archiveClient(id: string): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    await assertClientOwnership(id, coachId);

    await db.$transaction([
      db.mealPlan.updateMany({
        where: { clientId: id, status: "active" },
        data: { status: "archived" },
      }),
      db.client.update({ where: { id }, data: { status: "archived" } }),
    ]);

    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    return { success: true, id };
  } catch (err) {
    console.error("archiveClient:", err);
    return { success: false, error: "Failed to archive client" };
  }
}

export async function createTargetProfile(
  clientId: string,
  data: TargetProfileInput
): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    await assertClientOwnership(clientId, coachId);
    const parsed = targetProfileSchema.parse(data);

    const result = await db.$transaction(async (tx) => {
      await tx.clientTargetProfile.updateMany({
        where: { clientId, isActive: true },
        data: { isActive: false },
      });
      return tx.clientTargetProfile.create({
        data: {
          clientId,
          label: parsed.label || null,
          calorieTarget: parsed.calorieTarget,
          proteinTarget: parsed.proteinTarget,
          carbsTarget: parsed.carbsTarget,
          fatTarget: parsed.fatTarget,
          isActive: true,
        },
      });
    });

    revalidatePath(`/clients/${clientId}`);
    return { success: true, id: result.id };
  } catch (err) {
    console.error("createTargetProfile:", err);
    return { success: false, error: "Failed to create target profile" };
  }
}
