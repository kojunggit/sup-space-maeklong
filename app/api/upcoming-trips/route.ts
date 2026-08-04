import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { ROUTES_BY_ID } from "@/app/_components/trips-data";
import {
  CLOSED_TRIPS_SETTING_KEY,
  parseClosedTripKeys,
  regularTripKey,
  specialTripKey,
} from "@/app/lib/trip-closure";

const THAI_DAYS_SHORT   = ["อา", "จ.", "อ.", "พ.", "พฤ", "ศ.", "ส."];
const THAI_DAYS_FULL    = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export async function GET() {
  const todayIso = new Date().toISOString().slice(0, 10);

  try {
    const [settingRow, closedTripsRow] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "maxBoards" } }).catch(() => null),
      prisma.setting.findUnique({ where: { key: CLOSED_TRIPS_SETTING_KEY } }).catch(() => null),
    ]);
    const maxBoards = settingRow ? (parseInt(settingRow.value, 10) || 8) : 8;
    const closedTripKeys = parseClosedTripKeys(closedTripsRow?.value);

    // ── Regular trips ──────────────────────────────────────────────────────────
    const rows = await prisma.booking.findMany({
      where:   { status: "CONFIRMED", dateIso: { gte: todayIso } },
      orderBy: [{ dateIso: "asc" }, { timeSlot: "asc" }],
    });

    const groups = new Map<string, (typeof rows)[number][]>();
    for (const row of rows) {
      if (!row.dateIso || !row.routeId) continue;
      const key = `${row.dateIso}|${row.timeSlot}|${row.routeId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    // Routes are DB-driven; the static map only covers the original seed routes
    const routeIds  = [...new Set(rows.map((r) => r.routeId).filter(Boolean) as string[])];
    const routeRows = routeIds.length > 0
      ? await prisma.paddleRoute.findMany({
          where:  { id: { in: routeIds } },
          select: { id: true, cat: true, name: true, note: true, km: true, price: true, duration: true, recommend: true },
        })
      : [];
    const dbRouteMap = Object.fromEntries(routeRows.map((r) => [r.id, r]));

    const trips: object[] = [];

    for (const bookings of Array.from(groups.values())) {
      const first  = bookings[0];
      const d      = new Date(first.dateIso! + "T00:00:00");
      const joined = bookings.reduce((sum: number, b) => sum + b.paddlers, 0);
      const route  = first.routeId ? (dbRouteMap[first.routeId] ?? ROUTES_BY_ID[first.routeId] ?? null) : null;
      trips.push({
        id:       `${first.dateIso}|${first.timeSlot}|${first.routeId}`,
        type:     "regular",
        date:     `${THAI_DAYS_SHORT[d.getDay()]} ${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`,
        dateKey:  first.dateIso,
        day:      THAI_DAYS_FULL[d.getDay()],
        timeSlot: first.timeSlot,
        routeId:  first.routeId,
        route:    route ?? null,
        joined:   Math.min(joined, maxBoards),
        max:      maxBoards,
        host:     first.guestName ?? "ลูกค้า",
        closed:   closedTripKeys.has(regularTripKey(first.dateIso!, first.timeSlot, first.routeId!)),
      });
    }

    // ── Special trips ──────────────────────────────────────────────────────────
    const specialTrips = await (prisma as any).specialTrip.findMany({
      where:   { status: "ACTIVE", dateIso: { gte: todayIso } },
      orderBy: [{ dateIso: "asc" }, { timeSlot: "asc" }],
    });

    for (const st of specialTrips) {
      const joinedRows = await prisma.booking.findMany({
        where:  { specialTripId: st.id, status: { not: "CANCELLED" } },
        select: { paddlers: true },
      });
      const joined = joinedRows.reduce((sum: number, b: { paddlers: number }) => sum + b.paddlers, 0);
      const d = new Date(st.dateIso + "T00:00:00");
      trips.push({
        id:            `special|${st.id}`,
        type:          "special",
        date:          st.date,
        dateKey:       st.dateIso,
        day:           THAI_DAYS_FULL[d.getDay()],
        timeSlot:      st.timeSlot,
        name:          st.name,
        description:   st.description,
        location:      st.location,
        rentalPrice:   st.rentalPrice,
        ownBoardPrice: st.ownBoardPrice,
        coverPhoto:    st.coverPhoto,
        joined:        Math.min(joined, st.maxBoards),
        max:           st.maxBoards,
        closed:        closedTripKeys.has(specialTripKey(st.id)),
      });
    }

    trips.sort((a: any, b: any) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    return NextResponse.json(trips, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err) {
    console.error("upcoming-trips API error:", err);
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
}
