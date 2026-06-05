"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/auth";
import { readTelegramConfig } from "@/app/lib/telegram-config";

const DEFAULT_MAX_BOARDS = 8;

export async function getMaxBoards(): Promise<number> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "maxBoards" } });
    const n = s ? parseInt(s.value, 10) : DEFAULT_MAX_BOARDS;
    return isNaN(n) || n < 1 ? DEFAULT_MAX_BOARDS : n;
  } catch {
    return DEFAULT_MAX_BOARDS;
  }
}

export async function setMaxBoards(value: number): Promise<{ ok: boolean }> {
  await assertAdmin();
  if (value < 1 || value > 50) return { ok: false };
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
  await assertAdmin();
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
  await assertAdmin();
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
// Reading the bot token is handled by `readTelegramConfig` in
// `@/app/lib/telegram-config` (a plain module, NOT a callable server action) so
// the secret is never exposed as an endpoint.

export async function setTelegramConfig(
  token: string,
  chatId: string,
): Promise<{ ok: boolean }> {
  await assertAdmin();
  const t = token.trim();
  const c = chatId.trim();
  if (!t || !c) return { ok: false };
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
  await assertAdmin();
  const config = await readTelegramConfig();
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

// ─── Telegram webhook (for the membership bot) ─────────────────────────────────

const DEFAULT_SITE_URL = "https://supspacemaeklong.com";

async function ensureWebhookSecret(): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key: "telegramWebhookSecret" } });
  if (row?.value) return row.value;
  const { randomBytes } = await import("crypto");
  const secret = randomBytes(24).toString("hex");
  await prisma.setting.upsert({
    where:  { key: "telegramWebhookSecret" },
    update: { value: secret },
    create: { key: "telegramWebhookSecret", value: secret },
  });
  return secret;
}

/** Register the inbound webhook with Telegram (url + secret_token). */
export async function setTelegramWebhook(baseUrl?: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  await assertAdmin();
  const config = await readTelegramConfig();
  if (!config) return { ok: false, error: "ตั้งค่า Bot Token และ Chat ID ก่อน" };
  try {
    const secret = await ensureWebhookSecret();
    const base = (baseUrl?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");
    const url = `${base}/api/telegram`;
    const res = await fetch(`https://api.telegram.org/bot${config.token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        secret_token: secret,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: true,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
    if (!res.ok || !body.ok) return { ok: false, error: body.description ?? `HTTP ${res.status}` };
    await prisma.setting.upsert({
      where:  { key: "telegramWebhookUrl" },
      update: { value: url },
      create: { key: "telegramWebhookUrl", value: url },
    });
    revalidatePath("/admin");
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function getTelegramWebhookInfo(): Promise<{
  ok: boolean; url?: string; pending?: number; lastError?: string; error?: string;
}> {
  await assertAdmin();
  const config = await readTelegramConfig();
  if (!config) return { ok: false, error: "ยังไม่ได้ตั้งค่า Bot" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${config.token}/getWebhookInfo`);
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean; result?: { url?: string; pending_update_count?: number; last_error_message?: string };
    };
    if (!res.ok || !body.ok) return { ok: false, error: `HTTP ${res.status}` };
    return {
      ok: true,
      url: body.result?.url || "(ยังไม่ได้ตั้ง)",
      pending: body.result?.pending_update_count ?? 0,
      lastError: body.result?.last_error_message,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function deleteTelegramWebhook(): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin();
  const config = await readTelegramConfig();
  if (!config) return { ok: false, error: "ยังไม่ได้ตั้งค่า Bot" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${config.token}/deleteWebhook`, { method: "POST" });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
