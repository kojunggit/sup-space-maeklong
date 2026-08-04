"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/auth";
import { sendTelegramNotification } from "@/app/lib/telegram-notify";
import { readTelegramConfig } from "@/app/lib/telegram-config";
import { recordCampaignEntry } from "@/app/actions/campaign";
import { normalizePhone, isValidPhone, formatPhone } from "@/app/lib/phone";
import { grantComplimentaryPackage } from "@/app/lib/members-core";

export interface DanceChallengeEntryPayload {
  name: string;
  phone: string;
  clipUrl: string;
}

export interface DanceChallengeEntryRecord {
  id: string;
  name: string;
  phone: string;
  clipUrl: string;
  slotGranted: boolean;
  createdAt: string;
}

export async function submitDanceChallengeEntry(
  payload: DanceChallengeEntryPayload,
): Promise<{ ok: boolean; error?: string }> {
  const name = payload.name.trim();
  const rawPhone = payload.phone.trim();
  const clipUrl = payload.clipUrl.trim();

  if (!name || !rawPhone || !clipUrl) {
    return { ok: false, error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" };
  }
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) {
    return { ok: false, error: "เบอร์โทรไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)" };
  }
  if (!/^https?:\/\/.+/i.test(clipUrl)) {
    return { ok: false, error: "ลิงก์คลิปต้องขึ้นต้นด้วย http:// หรือ https://" };
  }

  try {
    // One person can submit multiple clips, but only the FIRST entry per phone
    // number counts toward the 30-slot free-trip quota / triggers the
    // complimentary membership grant — matches the published campaign rules.
    const priorEntry = await prisma.danceChallengeEntry.findFirst({ where: { phone } });
    const isFirstEntry = !priorEntry;

    let slotGranted = false;
    if (isFirstEntry) {
      const result = await recordCampaignEntry();
      slotGranted = result.slotGranted;
      if (slotGranted) {
        await grantComplimentaryPackage(name, phone, 1, "รางวัลจากกิจกรรม Dance Challenge — สิทธิ์พาย SUP ฟรี 1 ครั้ง");
      }
    }

    const entry = await prisma.danceChallengeEntry.create({
      data: { name, phone, clipUrl, slotGranted },
    });

    const tgConfig = await readTelegramConfig();
    if (tgConfig) {
      const lines = [
        "🎶 <b>ผู้ร่วม Dance Challenge ใหม่!</b>",
        `👤 ${entry.name}`,
        `📞 ${formatPhone(entry.phone)}`,
        `🔗 ${entry.clipUrl}`,
      ];
      if (!isFirstEntry) {
        lines.push("↩️ ส่งคลิปซ้ำ (เบอร์นี้เคยลงทะเบียนแล้ว) — ไม่นับสิทธิ์ทริปฟรีเพิ่ม");
      } else if (slotGranted) {
        lines.push("🎟️ ได้รับสิทธิ์พายฟรี 1 ครั้ง — สร้างสมาชิกให้อัตโนมัติแล้ว");
      } else {
        lines.push("⚠️ สิทธิ์ทริปฟรีเต็มแล้ว — ยังมีสิทธิ์ลุ้นรางวัลใหญ่");
      }
      void sendTelegramNotification(lines.join("\n"), tgConfig.token, tgConfig.chatId);
    }

    revalidatePath("/admin/dance-challenge");
    return { ok: true };
  } catch (err) {
    console.error("submitDanceChallengeEntry error:", err);
    return { ok: false, error: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function getDanceChallengeEntries(): Promise<DanceChallengeEntryRecord[]> {
  await assertAdmin();
  try {
    const rows = await prisma.danceChallengeEntry.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  } catch (err) {
    console.error("getDanceChallengeEntries error:", err);
    return [];
  }
}
