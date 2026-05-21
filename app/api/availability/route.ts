import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TIME_SLOTS, ROUTES_BY_ID } from "@/app/_components/trips-data";

function getPrisma() {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse "09:00" → 9, returns null for legacy "MORNING"/"AFTERNOON" */
function parseHour(slot: string): number | null {
  const n = parseInt(slot.split(":")[0], 10);
  return isNaN(n) ? null : n;
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

    // Closed slots from settings
    const closedRow = await prisma.setting.findUnique({ where: { key: "closedSlots" } }).catch(() => null);
    const closedSlots: Array<{ date: string; hour?: string }> = closedRow
      ? (JSON.parse(closedRow.value) as Array<{ date: string; hour?: string }>)
      : [];

    // Fetch all non-cancelled bookings in range (need routeId for duration)
    const rows = await prisma.booking.findMany({
      where: {
        status:  { in: ["CONFIRMED", "PENDING"] },
        dateIso: { gte: todayIso, lt: limitIso },
      },
      select: { dateIso: true, timeSlot: true, routeId: true },
    });

    // Build occupied-hours set: "2026-05-22|9" → occupied
    // Each booking occupies [startHour, startHour + duration - 1]
    const occupied = new Set<string>();
    for (const r of rows) {
      if (!r.dateIso) continue;
      const startHour = parseHour(r.timeSlot);
      if (startHour === null) continue; // legacy MORNING/AFTERNOON — skip
      const route    = r.routeId ? ROUTES_BY_ID[r.routeId] : null;
      const duration = route?.duration ?? 2;
      for (let h = startHour; h < startHour + duration && h <= 17; h++) {
        occupied.add(`${r.dateIso}|${h}`);
      }
    }

    const result = Array.from({ length: 14 }, (_, i) => {
      const d   = new Date(today.getTime() + i * 86_400_000);
      const iso = toIso(d);

      const isDayClosed = closedSlots.some((s) => s.date === iso && !s.hour);

      const hours: Record<string, boolean> = {};
      for (const h of TIME_SLOTS) {
        if (isDayClosed) {
          hours[h] = false;
        } else {
          const hourNum      = parseInt(h.split(":")[0], 10);
          const isHourClosed = closedSlots.some((s) => s.date === iso && s.hour === h);
          hours[h]           = !isHourClosed && !occupied.has(`${iso}|${hourNum}`);
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
