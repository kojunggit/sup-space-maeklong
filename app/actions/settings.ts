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
