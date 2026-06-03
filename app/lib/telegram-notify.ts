import { ROUTES_BY_ID, formatSlot } from "@/app/_components/trips-data";

export async function sendTelegramNotification(
  message: string,
  token: string,
  chatId: string,
): Promise<void> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      console.error(`Telegram notify error: HTTP ${res.status}`, await res.text());
    }
  } catch (err) {
    console.error("Telegram notify fetch failed:", err);
  }
}

// ─── Inline-keyboard helpers (used by the membership webhook) ──────────────────

/** One inline-keyboard button. */
export interface TgButton { text: string; callback_data: string; }

/** Send a message with an inline keyboard. Returns the new message_id on success. */
export async function sendMessageWithKeyboard(
  text: string,
  token: string,
  chatId: string | number,
  keyboard?: TgButton[][],
): Promise<{ ok: boolean; messageId?: number }> {
  try {
    const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" };
    if (keyboard) body.reply_markup = { inline_keyboard: keyboard };
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: { message_id?: number } };
    if (!res.ok || !json.ok) {
      console.error(`Telegram sendMessage error: HTTP ${res.status}`, json);
      return { ok: false };
    }
    return { ok: true, messageId: json.result?.message_id };
  } catch (err) {
    console.error("Telegram sendMessage failed:", err);
    return { ok: false };
  }
}

/** Edit an existing message's text (and optionally its keyboard; omit to remove buttons). */
export async function editMessageText(
  text: string,
  token: string,
  chatId: string | number,
  messageId: number,
  keyboard?: TgButton[][],
): Promise<{ ok: boolean }> {
  try {
    const body: Record<string, unknown> = { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML" };
    body.reply_markup = keyboard ? { inline_keyboard: keyboard } : { inline_keyboard: [] };
    const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error(`Telegram editMessageText error: HTTP ${res.status}`, await res.text());
    return { ok: res.ok };
  } catch (err) {
    console.error("Telegram editMessageText failed:", err);
    return { ok: false };
  }
}

/** Acknowledge a callback query (stops the button's loading spinner; optional toast text). */
export async function answerCallbackQuery(
  callbackQueryId: string,
  token: string,
  text?: string,
): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text: text ?? "" }),
    });
    return { ok: res.ok };
  } catch (err) {
    console.error("Telegram answerCallbackQuery failed:", err);
    return { ok: false };
  }
}

export function buildBookingMessage(booking: {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  date: string;
  timeSlot: string;
  routeId: string | null;
  paddlers: number;
  total: number | null;
  contactChannel: string | null;
  contactId: string | null;
  pickupAddress: string | null;
  notes: string | null;
}): string {
  const ref       = booking.id.slice(-8).toUpperCase();
  const routeName = booking.routeId ? (ROUTES_BY_ID[booking.routeId]?.name ?? booking.routeId) : "—";
  const timeLabel = formatSlot(booking.timeSlot);

  const lines: string[] = [
    "🏄 <b>จองทริปใหม่!</b>",
    `📋 #${ref}`,
    `👤 ${booking.guestName ?? "—"}`,
    `📞 ${booking.guestPhone ?? "—"}`,
    `📅 ${booking.date} · ${timeLabel}`,
    `🗺 ${routeName}`,
    `🏄 ${booking.paddlers} บอร์ด`,
    `💰 ฿${(booking.total ?? 0).toLocaleString("th-TH")}`,
  ];

  if (booking.contactChannel && booking.contactId) {
    lines.push(`💬 ${booking.contactChannel}: ${booking.contactId}`);
  }
  if (booking.pickupAddress) {
    lines.push(`📍 รับ-ส่ง: ${booking.pickupAddress}`);
  }
  if (booking.notes) {
    lines.push(`📝 ${booking.notes}`);
  }

  return lines.join("\n");
}
