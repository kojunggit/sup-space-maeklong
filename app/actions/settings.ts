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
  id:         string;
  date:       string;    // ISO "2026-12-31"
  hour?:      string;    // legacy single hour "09:00"
  startHour?: string;    // range start "09:00" — closed from this hour…
  endHour?:   string;    // …to this hour "12:00" (inclusive)
  label?:     string;    // optional admin note
  // If hour, startHour and endHour are all omitted → the whole day is closed
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

// ─── Telegram config ──────────────────────────────────────────────────────────

export async function getTelegramConfig(): Promise<{ token: string; chatId: string } | null> {
  const prisma = getPrisma();
  try {
    const [tokenRow, chatIdRow] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "telegramToken" } }),
      prisma.setting.findUnique({ where: { key: "telegramChatId" } }),
    ]);
    const token  = tokenRow?.value?.trim()  ?? "";
    const chatId = chatIdRow?.value?.trim() ?? "";
    if (!token || !chatId) return null;
    return { token, chatId };
  } catch {
    return null;
  }
}

export async function setTelegramConfig(
  token: string,
  chatId: string,
): Promise<{ ok: boolean }> {
  const t = token.trim();
  const c = chatId.trim();
  if (!t || !c) return { ok: false };
  const prisma = getPrisma();
  try {
    await Promise.all([
      prisma.setting.upsert({
        where:  { key: "telegramToken" },
        update: { value: t },
        create: { key: "telegramToken", value: t },
      }),
      prisma.setting.upsert({
        where:  { key: "telegramChatId" },
        update: { value: c },
        create: { key: "telegramChatId", value: c },
      }),
    ]);
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("setTelegramConfig error:", err);
    return { ok: false };
  }
}

export async function testTelegramConfig(): Promise<{ ok: boolean; error?: string }> {
  const config = await getTelegramConfig();
  if (!config) return { ok: false, error: "ยังไม่ได้ตั้งค่า Bot Token หรือ Chat ID" };
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${config.token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id:    config.chatId,
          text:       "✅ ทดสอบการแจ้งเตือน Telegram สำเร็จ!",
          parse_mode: "HTML",
        }),
      },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { description?: string };
      return { ok: false, error: body.description ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
