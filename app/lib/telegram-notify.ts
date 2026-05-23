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
