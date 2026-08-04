"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/auth";
import { getActiveSpecialTrips } from "@/app/actions/special-trips";
import type { UpcomingTrip } from "@/app/_components/trips-data";
import {
  createBookingRecord,
  type BookingPayload,
  type BookingResult,
} from "@/app/lib/booking-core";
import {
  CLOSED_TRIPS_SETTING_KEY,
  parseClosedTripKeys,
  regularTripKey,
  specialTripKey,
} from "@/app/lib/trip-closure";

export type { BookingPayload, BookingResult };

export async function createBooking(payload: BookingPayload): Promise<BookingResult> {
  return createBookingRecord(payload);
}

// ─── Admin: read bookings ─────────────────────────────────────────────────────

export interface BookingRecord {
  id: string;
  date: string;
  dateIso: string | null;
  timeSlot: string;
  routeId: string | null;
  routeName: string | null;
  routeKm: number | null;
  specialTripId: string | null;
  specialTripName: string | null;
  boardChoice: string | null;
  paddlers: number;
  weight: number | null;
  skillLevel: string | null;
  hasPhoto: boolean;
  photoPermission: string;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  contactChannel: string | null;
  contactId: string | null;
  pickupAddress: string | null;
  notes: string | null;
  promoCode: string | null;
  total: number | null;
  status: string;
  createdAt: string;
  tripClosed: boolean;
}

export async function getBookings(
  status?: string,
  dateRange?: "upcoming" | "past",
): Promise<BookingRecord[]> {
  await assertAdmin();
  const todayIso = new Date().toISOString().slice(0, 10);
  try {
    const statusFilter = status && status !== "ALL" ? { status } : {};
    const dateFilter =
      dateRange === "upcoming" ? { OR: [{ dateIso: { gte: todayIso } }, { dateIso: null }] } :
      dateRange === "past"     ? { dateIso: { lt: todayIso } } :
      {};
    const orderBy =
      dateRange === "upcoming" ? [{ dateIso: "asc" as const }, { timeSlot: "asc" as const }] :
      dateRange === "past"     ? [{ dateIso: "desc" as const }] :
      [{ createdAt: "desc" as const }];

    const rows = await prisma.booking.findMany({
      where: { ...statusFilter, ...dateFilter },
      orderBy,
    });
    const bookings = rows as import("@prisma/client").Booking[];

    // Resolve special trip names in one extra query
    const stIds = [...new Set(bookings.map((b) => b.specialTripId).filter(Boolean) as string[])];
    const stRows = stIds.length > 0
      ? await prisma.specialTrip.findMany({ where: { id: { in: stIds } }, select: { id: true, name: true } })
      : [];
    const stNameMap = Object.fromEntries(stRows.map((st) => [st.id, st.name]));

    // Resolve route names from the DB (routes are DB-driven; the static
    // ROUTES_BY_ID map only knows the original seed routes)
    const routeIds = [...new Set(bookings.map((b) => b.routeId).filter(Boolean) as string[])];
    const routeRows = routeIds.length > 0
      ? await prisma.paddleRoute.findMany({ where: { id: { in: routeIds } }, select: { id: true, name: true, km: true } })
      : [];
    const routeMap = Object.fromEntries(routeRows.map((r) => [r.id, r]));

    const closedTripsRow = await prisma.setting.findUnique({
      where: { key: CLOSED_TRIPS_SETTING_KEY },
      select: { value: true },
    }).catch(() => null);
    const closedTripKeys = parseClosedTripKeys(closedTripsRow?.value);

    return bookings.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      specialTripName: b.specialTripId ? (stNameMap[b.specialTripId] ?? null) : null,
      routeName: b.routeId ? (routeMap[b.routeId]?.name ?? null) : null,
      routeKm:   b.routeId ? (routeMap[b.routeId]?.km ?? null) : null,
      tripClosed: b.specialTripId
        ? closedTripKeys.has(specialTripKey(b.specialTripId))
        : !!(b.dateIso && b.routeId && closedTripKeys.has(regularTripKey(b.dateIso, b.timeSlot, b.routeId))),
    }));
  } catch (err) {
    console.error("getBookings error:", err);
    return [];
  }
}

// ─── Public: upcoming trips ───────────────────────────────────────────────────

const THAI_DAYS_FULL  = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const THAI_DAYS_SHORT = ["อา", "จ.", "อ.", "พ.", "พฤ", "ศ.", "ส."];
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export async function getUpcomingTrips(): Promise<UpcomingTrip[]> {
  const todayIso = new Date().toISOString().slice(0, 10);
  try {
    // Read capacity setting (default 8)
    const [settingRow, closedTripsRow] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "maxBoards" } }).catch(() => null),
      prisma.setting.findUnique({ where: { key: CLOSED_TRIPS_SETTING_KEY } }).catch(() => null),
    ]);
    const maxBoards = settingRow ? (parseInt(settingRow.value, 10) || 8) : 8;
    const closedTripKeys = parseClosedTripKeys(closedTripsRow?.value);

    const rows = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        dateIso: { gte: todayIso },
      },
      orderBy: [{ dateIso: "asc" }, { timeSlot: "asc" }],
    });

    // Group bookings by (dateIso | timeSlot | routeId)
    const groups = new Map<string, (typeof rows)[number][]>();
    for (const row of rows) {
      if (!row.dateIso || !row.routeId) continue;
      const key = `${row.dateIso}|${row.timeSlot}|${row.routeId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    const trips: UpcomingTrip[] = [];
    for (const bookings of Array.from(groups.values())) {
      const first = bookings[0];
      const d = new Date(first.dateIso! + "T00:00:00");
      const joined = bookings.reduce((sum: number, b) => sum + b.paddlers, 0);
      trips.push({
        id:       `${first.dateIso}|${first.timeSlot}|${first.routeId}`,
        date:     `${THAI_DAYS_SHORT[d.getDay()]} ${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`,
        dateKey:  first.dateIso!,
        day:      THAI_DAYS_FULL[d.getDay()],
        timeSlot: first.timeSlot as "MORNING" | "AFTERNOON",
        routeId:  first.routeId!,
        joined:   Math.min(joined, maxBoards),
        max:      maxBoards,
        host:     first.guestName ?? "ลูกค้า",
        closed:   closedTripKeys.has(regularTripKey(first.dateIso!, first.timeSlot, first.routeId!)),
      });
    }

    // Merge active special trips
    const specialTrips = await getActiveSpecialTrips();
    for (const st of specialTrips) {
      const joinedRows = await prisma.booking.findMany({
        where: { specialTripId: st.id, status: { not: "CANCELLED" } },
        select: { paddlers: true },
      });
      const joined = joinedRows.reduce((sum, b) => sum + b.paddlers, 0);
      const d = new Date(st.dateIso + "T00:00:00");
      trips.push({
        id:                  `special|${st.id}`,
        date:                st.date,
        dateKey:             st.dateIso,
        day:                 THAI_DAYS_FULL[d.getDay()],
        timeSlot:            st.timeSlot,
        routeId:             "",
        joined:              Math.min(joined, st.maxBoards),
        max:                 st.maxBoards,
        host:                "ทีมงาน",
        isSpecial:           true,
        specialTripId:       st.id,
        specialName:         st.name,
        specialDescription:  st.description ?? undefined,
        specialRentalPrice:  st.rentalPrice,
        specialOwnBoardPrice: st.ownBoardPrice,
        specialLocation:     st.location,
        specialCoverPhoto:   st.coverPhoto ?? undefined,
        closed:              closedTripKeys.has(specialTripKey(st.id)),
      });
    }

    // Sort all trips by dateIso then timeSlot
    trips.sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    return trips;
  } catch (err) {
    console.error("getUpcomingTrips error:", err);
    return [];
  }
}

// ─── Admin: update status ─────────────────────────────────────────────────────

export async function updateBookingStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED",
): Promise<{ ok: boolean }> {
  await assertAdmin();
  try {
    await prisma.booking.update({ where: { id }, data: { status } });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return { ok: false };
  }
}

export async function setTripClosed(
  tripKey: string,
  closed: boolean,
): Promise<{ ok: boolean }> {
  await assertAdmin();
  if (!tripKey.startsWith("regular|") && !tripKey.startsWith("special|")) {
    return { ok: false };
  }
  try {
    const row = await prisma.setting.findUnique({
      where: { key: CLOSED_TRIPS_SETTING_KEY },
      select: { value: true },
    });
    const keys = parseClosedTripKeys(row?.value);
    if (closed) keys.add(tripKey);
    else keys.delete(tripKey);
    await prisma.setting.upsert({
      where: { key: CLOSED_TRIPS_SETTING_KEY },
      update: { value: JSON.stringify([...keys]) },
      create: { key: CLOSED_TRIPS_SETTING_KEY, value: JSON.stringify([...keys]) },
    });
    revalidatePath("/");
    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (err) {
    console.error("setTripClosed error:", err);
    return { ok: false };
  }
}
