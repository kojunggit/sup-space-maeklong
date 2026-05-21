"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { revalidatePath } from "next/cache";
import { ROUTES_BY_ID } from "@/app/_components/trips-data";
import type { UpcomingTrip } from "@/app/_components/trips-data";

/** Parse "09:00" → 9. Returns null for legacy "MORNING"/"AFTERNOON". */
function parseHour(slot: string): number | null {
  const n = parseInt(slot.split(":")[0], 10);
  return isNaN(n) ? null : n;
}

// PrismaPg in Prisma 7 accepts a connection string directly (string | Pool | PoolConfig)
function getPrisma() {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

// ─── Booking creation ─────────────────────────────────────────────────────────

export interface BookingPayload {
  date: string;
  dateIso?: string;  // ISO "2026-05-23" — for filtering upcoming trips
  timeSlot: string;
  routeId: string;
  paddlers: number;
  weight: number;
  skillLevel: string;
  photoPermission: string;
  total: number;
  guestName: string;
  guestPhone: string;
  contactChannel?: string;
  contactId?: string;
  pickupAddress?: string;
  notes?: string;
}

export interface BookingResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function createBooking(payload: BookingPayload): Promise<BookingResult> {
  const prisma = getPrisma();
  try {
    // ── Guard 1: no duplicate (same phone + date + time, not cancelled) ─────
    if (payload.guestPhone && payload.dateIso) {
      const dup = await prisma.booking.findFirst({
        where: {
          guestPhone: payload.guestPhone,
          dateIso:    payload.dateIso,
          timeSlot:   payload.timeSlot,
          status:     { not: "CANCELLED" },
        },
        select: { id: true },
      });
      if (dup) {
        return { ok: false, error: "คุณมีการจองในวันและเวลานี้อยู่แล้ว กรุณาตรวจสอบการจองของคุณ" };
      }
    }

    // ── Guard 2: slot not in closed list ────────────────────────────────────
    if (payload.dateIso) {
      const closedRow = await prisma.setting.findUnique({ where: { key: "closedSlots" } }).catch(() => null);
      if (closedRow) {
        const closed = JSON.parse(closedRow.value) as Array<{ date: string; hour?: string }>;
        const blocked = closed.some(
          (s) => s.date === payload.dateIso && (!s.hour || s.hour === payload.timeSlot),
        );
        if (blocked) {
          return { ok: false, error: "วันและเวลานี้ปิดให้บริการ กรุณาเลือกวันหรือเวลาอื่น" };
        }
      }
    }

    // ── Guard 3: 1 trip per slot — duration-overlap check ───────────────────
    // Rule: each slot can have at most 1 trip group (same date+time+route = join ✓,
    //       any overlap with a different booking = ✗)
    const newStartHour = parseHour(payload.timeSlot);
    if (newStartHour !== null && payload.dateIso) {
      const newRoute    = ROUTES_BY_ID[payload.routeId];
      const newDuration = newRoute?.duration ?? 2;
      // Hours the new booking would occupy: [H, H+D-1]
      const newEnd = newStartHour + newDuration - 1;

      const sameDayBookings = await prisma.booking.findMany({
        where: {
          dateIso: payload.dateIso,
          status:  { not: "CANCELLED" },
        },
        select: { timeSlot: true, routeId: true },
      });

      for (const eb of sameDayBookings) {
        const ebStart = parseHour(eb.timeSlot);
        if (ebStart === null) continue; // skip legacy MORNING/AFTERNOON entries

        // Same trip (join): same start + same route → allowed
        if (ebStart === newStartHour && eb.routeId === payload.routeId) continue;

        const ebRoute    = eb.routeId ? ROUTES_BY_ID[eb.routeId] : null;
        const ebDuration = ebRoute?.duration ?? 2;
        const ebEnd      = ebStart + ebDuration - 1;

        // Overlap: [newStart, newEnd] ∩ [ebStart, ebEnd] is non-empty
        if (newStartHour <= ebEnd && ebStart <= newEnd) {
          return { ok: false, error: "ช่วงเวลานี้มีทริปอยู่แล้ว กรุณาเลือกเวลาอื่น" };
        }
      }
    }

    const booking = await prisma.booking.create({
      data: {
        date:            payload.date,
        dateIso:         payload.dateIso || null,
        timeSlot:        payload.timeSlot,
        routeId:         payload.routeId,
        paddlers:        payload.paddlers,
        weight:          payload.weight,
        skillLevel:      payload.skillLevel,
        hasPhoto:        payload.photoPermission !== "notAllow",
        photoPermission: payload.photoPermission,
        total:           payload.total,
        guestName:       payload.guestName        || null,
        guestPhone:      payload.guestPhone       || null,
        contactChannel:  payload.contactChannel   || null,
        contactId:       payload.contactId        || null,
        pickupAddress:   payload.pickupAddress    || null,
        notes:           payload.notes || null,
        status:          "PENDING",
      },
    });
    revalidatePath("/");   // refresh UpcomingTrips on home page
    return { ok: true, id: booking.id };
  } catch (err) {
    console.error("createBooking error:", err);
    return { ok: false, error: "ไม่สามารถบันทึกการจองได้ กรุณาลองใหม่อีกครั้ง" };
  }
}

// ─── Admin: read bookings ─────────────────────────────────────────────────────

export interface BookingRecord {
  id: string;
  date: string;
  dateIso: string | null;
  timeSlot: string;
  routeId: string | null;
  paddlers: number;
  weight: number | null;
  skillLevel: string | null;
  hasPhoto: boolean;
  photoPermission: string;
  guestName: string | null;
  guestPhone: string | null;
  contactChannel: string | null;
  contactId: string | null;
  pickupAddress: string | null;
  notes: string | null;
  total: number | null;
  status: string;
  createdAt: string;
}

export async function getBookings(status?: string): Promise<BookingRecord[]> {
  const prisma = getPrisma();
  try {
    const rows = await prisma.booking.findMany({
      where: status && status !== "ALL" ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return (rows as import("@prisma/client").Booking[]).map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
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
  const prisma = getPrisma();
  const todayIso = new Date().toISOString().slice(0, 10);
  try {
    // Read capacity setting (default 8)
    const settingRow = await prisma.setting.findUnique({ where: { key: "maxBoards" } }).catch(() => null);
    const maxBoards  = settingRow ? (parseInt(settingRow.value, 10) || 8) : 8;

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
    for (const [, bookings] of groups) {
      const first = bookings[0];
      const d = new Date(first.dateIso! + "T00:00:00");
      const joined = bookings.reduce((sum, b) => sum + b.paddlers, 0);
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
      });
    }

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
  const prisma = getPrisma();
  try {
    await prisma.booking.update({ where: { id }, data: { status } });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return { ok: false };
  }
}
