import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

const MAX_BOARDS = 8;

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function allAvailable(days = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() + i * 86_400_000);
    return { date: toIso(d), morning: true, afternoon: true, available: true };
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

    // Sum confirmed paddlers per (dateIso, timeSlot)
    const rows = await prisma.booking.findMany({
      where: {
        status:  "CONFIRMED",
        dateIso: { gte: todayIso, lt: limitIso },
      },
      select: { dateIso: true, timeSlot: true, paddlers: true },
    });

    // Build a map: "2026-05-23|MORNING" → total boards booked
    const totals = new Map<string, number>();
    for (const r of rows) {
      if (!r.dateIso) continue;
      const key = `${r.dateIso}|${r.timeSlot}`;
      totals.set(key, (totals.get(key) ?? 0) + r.paddlers);
    }

    const result = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today.getTime() + i * 86_400_000);
      const iso = toIso(d);
      const morning   = (totals.get(`${iso}|MORNING`)   ?? 0) < MAX_BOARDS;
      const afternoon = (totals.get(`${iso}|AFTERNOON`) ?? 0) < MAX_BOARDS;
      return { date: iso, morning, afternoon, available: morning || afternoon };
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
