import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TIME_SLOTS } from "@/app/_components/trips-data";

function getPrisma() {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function allAvailable(days = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() + i * 86_400_000);
    const hours = Object.fromEntries(TIME_SLOTS.map((h) => [h, true]));
    return { date: toIso(d), hours, available: true };
  });
}

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso  = toIso(today);
  const limitDate = new Date(today.getTime() + 14 * 86_400_000);
  const limitIso  = toIso(limitDate);

  try {
    const prisma = getPrisma();

    // Read max boards from settings (default 8)
    const settingRow = await prisma.setting.findUnique({ where: { key: "maxBoards" } }).catch(() => null);
    const maxBoards  = settingRow ? (parseInt(settingRow.value, 10) || 8) : 8;

    // Read closed slots from settings
    const closedRow  = await prisma.setting.findUnique({ where: { key: "closedSlots" } }).catch(() => null);
    const closedSlots: Array<{ date: string; hour?: string }> = closedRow
      ? (JSON.parse(closedRow.value) as Array<{ date: string; hour?: string }>)
      : [];

    // Sum confirmed+pending paddlers per (dateIso, timeSlot) — one hour slot per booking
    const rows = await prisma.booking.findMany({
      where: {
        status:  { in: ["CONFIRMED", "PENDING"] },
        dateIso: { gte: todayIso, lt: limitIso },
      },
      select: { dateIso: true, timeSlot: true, paddlers: true },
    });

    // Map: "2026-05-23|09:00" → total boards booked
    const totals = new Map<string, number>();
    for (const r of rows) {
      if (!r.dateIso) continue;
      const key = `${r.dateIso}|${r.timeSlot}`;
      totals.set(key, (totals.get(key) ?? 0) + r.paddlers);
    }

    const result = Array.from({ length: 14 }, (_, i) => {
      const d   = new Date(today.getTime() + i * 86_400_000);
      const iso = toIso(d);

      // Is the whole day closed?
      const isDayClosed = closedSlots.some((s) => s.date === iso && !s.hour);

      const hours: Record<string, boolean> = {};
      for (const h of TIME_SLOTS) {
        if (isDayClosed) {
          hours[h] = false;
        } else {
          const isHourClosed = closedSlots.some((s) => s.date === iso && s.hour === h);
          const booked       = totals.get(`${iso}|${h}`) ?? 0;
          hours[h]           = !isHourClosed && booked < maxBoards;
        }
      }

      const available = Object.values(hours).some(Boolean);
      return { date: iso, hours, available };
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err) {
    console.error("Availability error:", err);
    return NextResponse.json(allAvailable(), {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
}
