import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getMemberByPhone, recordVisit, type MemberView, type PackageView } from "@/app/actions/members";
import {
  sendMessageWithKeyboard, editMessageText, answerCallbackQuery, type TgButton,
} from "@/app/lib/telegram-notify";
import { normalizePhone, isValidPhone } from "@/app/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPrisma() {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

/** Read bot token, owner chat id, and webhook secret from the Setting table. */
async function getBotConfig(): Promise<{ token: string; chatId: string; secret: string } | null> {
  const prisma = getPrisma();
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: ["telegramToken", "telegramChatId", "telegramWebhookSecret"] } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const token = map.telegramToken?.trim();
    const chatId = map.telegramChatId?.trim();
    const secret = map.telegramWebhookSecret?.trim();
    if (!token || !chatId || !secret) return null;
    return { token, chatId, secret };
  } catch {
    return null;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Build the confirmation message + inline keyboard for a looked-up member. */
function buildPreview(view: MemberView): { text: string; keyboard?: TgButton[][] } {
  const head = `👤 <b>${view.name}</b> · ${view.phoneDisplay}`;
  const usable = view.usablePackages;

  if (usable.length === 0) {
    const lines = view.packages.length
      ? view.packages.map((p) => `• ${p.label}`).join("\n")
      : "• ยังไม่มีแพคเกจ";
    return { text: `${head}\n\n${lines}\n\n⛔ <b>ไม่มีสิทธิ์คงเหลือ</b> — กรุณาต่อแพคเกจ` };
  }

  const btnLabel = (p: PackageView): string =>
    p.type === "MONTH"
      ? (p.startDateIso ? `✅ ใช้รายเดือน (ถึง ${p.endDateBE})` : "✅ ใช้แพครายเดือน")
      : `✅ ใช้ 10 ครั้ง · เหลือ ${p.remaining}`;

  const keyboard: TgButton[][] = usable.map((p) => [{ text: btnLabel(p), callback_data: `use:${p.id}` }]);
  keyboard.push([{ text: "❌ ยกเลิก", callback_data: "cancel" }]);

  const detail = usable.map((p) => `• ${p.label}`).join("\n");
  const prompt = usable.length > 1 ? "เลือกแพคที่จะใช้:" : "ยืนยันบันทึกการมา?";
  return { text: `${head}\n\n${detail}\n\n${prompt}`, keyboard };
}

export async function POST(req: NextRequest) {
  // Always reply 200 so Telegram does not retry (which would double-process).
  const ok = () => NextResponse.json({ ok: true });

  const config = await getBotConfig();
  if (!config) {
    console.warn("telegram webhook: bot not fully configured");
    return ok();
  }

  // Gate 1: secret header
  const headerSecret = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (!safeEqual(headerSecret, config.secret)) {
    console.warn("telegram webhook: bad secret token");
    return ok();
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return ok();
  }

  // ── Callback (button tap) ──────────────────────────────────────────────────
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = cq.message?.chat?.id;
    const messageId = cq.message?.message_id;
    // Gate 2: only the owner
    if (String(chatId) !== config.chatId) {
      await answerCallbackQuery(cq.id, config.token);
      return ok();
    }
    const data: string = cq.data ?? "";

    if (data === "cancel") {
      if (messageId) await editMessageText("❌ ยกเลิกแล้ว", config.token, chatId, messageId);
      await answerCallbackQuery(cq.id, config.token, "ยกเลิก");
      return ok();
    }
    if (data.startsWith("use:")) {
      const packageId = data.slice(4);
      const result = await recordVisit({ packageId, via: "telegram" });
      if (messageId) await editMessageText(result.summary, config.token, chatId, messageId);
      await answerCallbackQuery(cq.id, config.token, result.ok ? "บันทึกแล้ว ✅" : "ไม่สำเร็จ");
      return ok();
    }
    await answerCallbackQuery(cq.id, config.token);
    return ok();
  }

  // ── Message (owner types a phone number) ────────────────────────────────────
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    // Gate 2: only the owner
    if (String(chatId) !== config.chatId) return ok();

    const text: string = (msg.text ?? "").trim();
    if (!text) return ok();

    // /start or help
    if (text.startsWith("/")) {
      await sendMessageWithKeyboard(
        "พิมพ์ <b>เบอร์โทรของสมาชิก</b> เพื่อตรวจสอบสิทธิ์และบันทึกการมาใช้บริการ",
        config.token, chatId,
      );
      return ok();
    }

    const phone = normalizePhone(text);
    if (!isValidPhone(phone)) {
      await sendMessageWithKeyboard(
        "⚠️ ไม่เข้าใจข้อความ — กรุณาพิมพ์เบอร์โทรของสมาชิก (เช่น 0812345678)",
        config.token, chatId,
      );
      return ok();
    }

    const view = await getMemberByPhone(phone);
    if (!view) {
      await sendMessageWithKeyboard(`❌ ไม่พบสมาชิกเบอร์ ${phone}`, config.token, chatId);
      return ok();
    }

    const { text: previewText, keyboard } = buildPreview(view);
    await sendMessageWithKeyboard(previewText, config.token, chatId, keyboard);
    return ok();
  }

  return ok();
}
