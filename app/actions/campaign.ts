"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/auth";
import { TOTAL_FREE_SLOTS } from "@/app/_components/campaign-config";

export interface CampaignStats {
  remainingSlots: number;
  participants: number;
}

const DEFAULT_STATS: CampaignStats = { remainingSlots: TOTAL_FREE_SLOTS, participants: 0 };

export async function getCampaignStats(): Promise<CampaignStats> {
  try {
    const [remaining, participants] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "campaignRemainingSlots" } }),
      prisma.setting.findUnique({ where: { key: "campaignParticipants" } }),
    ]);
    const r = remaining ? parseInt(remaining.value, 10) : DEFAULT_STATS.remainingSlots;
    const p = participants ? parseInt(participants.value, 10) : DEFAULT_STATS.participants;
    return {
      remainingSlots: isNaN(r) ? DEFAULT_STATS.remainingSlots : Math.max(0, Math.min(TOTAL_FREE_SLOTS, r)),
      participants:   isNaN(p) ? DEFAULT_STATS.participants : Math.max(0, p),
    };
  } catch {
    return DEFAULT_STATS;
  }
}

// Called once per submitted entry (see app/actions/dance-challenge.ts).
// Read-then-upsert via the typed Prisma client — same pattern already proven
// reliable elsewhere in this codebase (getMaxBoards/setMaxBoards). A raw-SQL
// atomic-UPDATE version was tried first but failed silently in production
// (via @prisma/adapter-pg) with no usable error trace, so this trades strict
// concurrency-safety (traffic here is a handful of submissions, not a risk)
// for something that's actually verified to work.
export async function recordCampaignEntry(): Promise<{ slotGranted: boolean }> {
  try {
    const stats = await getCampaignStats();
    const slotGranted = stats.remainingSlots > 0;
    const nextRemaining = Math.max(0, stats.remainingSlots - 1);
    const nextParticipants = stats.participants + 1;

    await Promise.all([
      prisma.setting.upsert({
        where:  { key: "campaignRemainingSlots" },
        update: { value: String(nextRemaining) },
        create: { key: "campaignRemainingSlots", value: String(nextRemaining) },
      }),
      prisma.setting.upsert({
        where:  { key: "campaignParticipants" },
        update: { value: String(nextParticipants) },
        create: { key: "campaignParticipants", value: String(nextParticipants) },
      }),
    ]);

    revalidatePath("/");
    revalidatePath("/routes");
    revalidatePath("/gallery");
    revalidatePath("/dance-challenge");
    revalidatePath("/admin/settings");
    return { slotGranted };
  } catch (err) {
    console.error("recordCampaignEntry error:", err instanceof Error ? err.stack : err);
    return { slotGranted: false };
  }
}

export async function setCampaignStats(stats: CampaignStats): Promise<{ ok: boolean }> {
  await assertAdmin();
  if (
    stats.remainingSlots < 0 || stats.remainingSlots > TOTAL_FREE_SLOTS ||
    stats.participants < 0 || stats.participants > 999999
  ) {
    return { ok: false };
  }
  try {
    await Promise.all([
      prisma.setting.upsert({
        where:  { key: "campaignRemainingSlots" },
        update: { value: String(stats.remainingSlots) },
        create: { key: "campaignRemainingSlots", value: String(stats.remainingSlots) },
      }),
      prisma.setting.upsert({
        where:  { key: "campaignParticipants" },
        update: { value: String(stats.participants) },
        create: { key: "campaignParticipants", value: String(stats.participants) },
      }),
    ]);
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/routes");
    revalidatePath("/gallery");
    revalidatePath("/dance-challenge");
    return { ok: true };
  } catch (err) {
    console.error("setCampaignStats error:", err);
    return { ok: false };
  }
}
