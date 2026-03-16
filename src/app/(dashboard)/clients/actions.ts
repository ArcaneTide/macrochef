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
          notes: client.notes || null,
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
    console.error("createClient:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to create client" };
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
        notes: parsed.notes || null,
      },
    });

    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    return { success: true, id };
  } catch (err) {
    console.error("updateClient:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update client" };
  }
}

export async function archiveClient(id: string): Promise<ActionResult> {
  try {
    const coachId = await getAuthedCoachId();
    await assertClientOwnership(id, coachId);

    await db.client.update({ where: { id }, data: { status: "archived" } });

    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    return { success: true, id };
  } catch (err) {
    console.error("archiveClient:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to archive client" };
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
    return { success: false, error: err instanceof Error ? err.message : "Failed to create target profile" };
  }
}
