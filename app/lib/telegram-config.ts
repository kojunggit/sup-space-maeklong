import { prisma } from "@/app/lib/prisma";

// Internal helper (NOT a server action). Reading the Telegram bot token must
// never be exposed as a callable endpoint — it is a secret. This module is
// imported server-to-server by the public booking flow and the webhook route;
// the admin settings page (behind middleware) can read it too.
export async function readTelegramConfig(): Promise<{ token: string; chatId: string } | null> {
  try {
    const [tokenRow, chatIdRow] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "telegramToken" } }),
      prisma.setting.findUnique({ where: { key: "telegramChatId" } }),
    ]);
    const token = tokenRow?.value?.trim() ?? "";
    const chatId = chatIdRow?.value?.trim() ?? "";
    if (!token || !chatId) return null;
    return { token, chatId };
  } catch {
    return null;
  }
}
