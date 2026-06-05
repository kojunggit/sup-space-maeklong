import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  TIME_SLOTS, ROUTES_BY_ID,
  isDayClosed, isHourClosed, type ClosedSlotShape,
} from "@/app/_components/trips-data";

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse "09:00" → 9, returns null for legacy "MORNING"/"AFTERNOON" */
function parseHour(slot: string): number | null {
  const n = parseInt(slot.split(":")[0], 10);
  return isNaN(n) ? null : n;
}

/** Parse an ISO date (YYYY-MM-DD) at local midnight; falls back to today */
function parseStart(value: string | null): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!value) return today;
  const d = new Date(value + "T00:00:00");
  if (isNaN(d.getTime())) return today;
  d.setHours(0, 0, 0, 0);
  // Never start before today
  return d < today ? today : d;
}

function allAvailable(start: Date, days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start.getTime() + i * 86_400_000);
    const hours = Object.fromEntries(TIME_SLOTS.map((h) => [h, true]));
    return { date: toIso(d), hours, available: true };
  });
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const start = parseStart(params.get("start"));
  // Window length — supports unlimited advance booking by requesting any month.
  // Clamp to a sane range to protect the DB query.
  const days = Math.min(Math.max(parseInt(params.get("days") ?? "14", 10) || 14, 1), 92);

  const startIso = toIso(start);
  const limitDate = new Date(start.getTime() + days * 86_400_000);
  const limitIso  = toIso(limitDate);

  try {
    // Closed slots from settings
    const closedRow = await prisma.setting.findUnique({ where: { key: "closedSlots" } }).catch(() => null);
    const closedSlots: ClosedSlotShape[] = closedRow
      ? (JSON.parse(closedRow.value) as ClosedSlotShape[])
      : [];

    // Fetch all non-cancelled bookings in range (need routeId for duration)
    const rows = await prisma.booking.findMany({
      where: {
        status:  { in: ["CONFIRMED", "PENDING"] },
        dateIso: { gte: startIso, lt: limitIso },
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

    const result = Array.from({ length: days }, (_, i) => {
      const d   = new Date(start.getTime() + i * 86_400_000);
      const iso = toIso(d);

      const dayClosed = isDayClosed(closedSlots, iso);

      const hours: Record<string, boolean> = {};
      for (const h of TIME_SLOTS) {
        if (dayClosed) {
          hours[h] = false;
        } else {
          const hourNum = parseInt(h.split(":")[0], 10);
          hours[h] = !isHourClosed(closedSlots, iso, h) && !occupied.has(`${iso}|${hourNum}`);
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
    return NextResponse.json(allAvailable(start, days), {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
}
