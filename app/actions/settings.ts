"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { revalidatePath } from "next/cache";

function getPrisma() {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

const DEFAULT_MAX_BOARDS = 8;

export async function getMaxBoards(): Promise<number> {
  const prisma = getPrisma();
  try {
    const s = await prisma.setting.findUnique({ where: { key: "maxBoards" } });
    const n = s ? parseInt(s.value, 10) : DEFAULT_MAX_BOARDS;
    return isNaN(n) || n < 1 ? DEFAULT_MAX_BOARDS : n;
  } catch {
    return DEFAULT_MAX_BOARDS;
  }
}

export async function setMaxBoards(value: number): Promise<{ ok: boolean }> {
  if (value < 1 || value > 50) return { ok: false };
  const prisma = getPrisma();
  try {
    await prisma.setting.upsert({
      where:  { key: "maxBoards" },
      update: { value: String(value) },
      create: { key: "maxBoards", value: String(value) },
    });
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("setMaxBoards error:", err);
    return { ok: false };
  }
}

// ─── Closed slots ─────────────────────────────────────────────────────────────

export interface ClosedSlot {
  id:     string;
  date:   string;    // ISO "2026-12-31"
  hour?:  string;    // "09:00" — if omitted the whole day is closed
  label?: string;    // optional admin note
}

export async function getClosedSlots(): Promise<ClosedSlot[]> {
  const prisma = getPrisma();
  try {
    const s = await prisma.setting.findUnique({ where: { key: "closedSlots" } });
    if (!s) return [];
    return JSON.parse(s.value) as ClosedSlot[];
  } catch {
    return [];
  }
}

export async function addClosedSlot(
  slot: Omit<ClosedSlot, "id">,
): Promise<{ ok: boolean }> {
  const prisma = getPrisma();
  try {
    const current = await getClosedSlots();
    const newSlot: ClosedSlot = {
      id:    Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      ...slot,
    };
    const updated = [...current, newSlot];
    await prisma.setting.upsert({
      where:  { key: "closedSlots" },
      update: { value: JSON.stringify(updated) },
      create: { key: "closedSlots", value: JSON.stringify(updated) },
    });
    revalidatePath("/admin");
    revalidatePath("/api/availability");
    return { ok: true };
  } catch (err) {
    console.error("addClosedSlot error:", err);
    return { ok: false };
  }
}

export async function removeClosedSlot(id: string): Promise<{ ok: boolean }> {
  const prisma = getPrisma();
  try {
    const current = await getClosedSlots();
    const updated = current.filter((s) => s.id !== id);
    await prisma.setting.upsert({
      where:  { key: "closedSlots" },
      update: { value: JSON.stringify(updated) },
      create: { key: "closedSlots", value: JSON.stringify(updated) },
    });
    revalidatePath("/admin");
    revalidatePath("/api/availability");
    return { ok: true };
  } catch (err) {
    console.error("removeClosedSlot error:", err);
    return { ok: false };
  }
}
