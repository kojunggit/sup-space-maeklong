"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { revalidatePath } from "next/cache";

// PRISMA_DATABASE_URL = postgres://...@db.prisma.io:5432/postgres?sslmode=require
// This URL has sslmode=require embedded — no extra ssl config needed.
function getPrisma() {
  const pool = new Pool({ connectionString: process.env.PRISMA_DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// ─── Booking creation ─────────────────────────────────────────────────────────

export interface BookingPayload {
  date: string;
  timeSlot: string;
  routeId: string;
  paddlers: number;
  weight: number;
  skillLevel: string;
  photoPermission: string;
  total: number;
  guestName: string;
  guestPhone: string;
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
    const booking = await prisma.booking.create({
      data: {
        date:            payload.date,
        timeSlot:        payload.timeSlot,
        routeId:         payload.routeId,
        paddlers:        payload.paddlers,
        weight:          payload.weight,
        skillLevel:      payload.skillLevel,
        hasPhoto:        payload.photoPermission !== "notAllow",
        photoPermission: payload.photoPermission,
        total:           payload.total,
        guestName:       payload.guestName  || null,
        guestPhone:      payload.guestPhone || null,
        pickupAddress:   payload.pickupAddress || null,
        notes:           payload.notes || null,
        status:          "PENDING",
      },
    });
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
  timeSlot: string;
  routeId: string | null;
  paddlers: number;
  weight: number | null;
  skillLevel: string | null;
  hasPhoto: boolean;
  photoPermission: string;
  guestName: string | null;
  guestPhone: string | null;
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
