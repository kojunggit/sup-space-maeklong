"use server";

import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { revalidatePath } from "next/cache";

function getPrisma() {
  return new PrismaClient().$extends(withAccelerate());
}

// ─── Booking creation ─────────────────────────────────────────────────────────

export interface BookingPayload {
  date: string;
  timeSlot: string;
  routeId: string;
  paddlers: number;
  weight: number;
  skillLevel: string;
  photoPermission: string; // "allow" | "notAllow" | "private"
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
  createdAt: string; // ISO string (serialisable for client components)
}

export async function getBookings(status?: string): Promise<BookingRecord[]> {
  const prisma = getPrisma();
  try {
    const rows = await prisma.booking.findMany({
      where: status && status !== "ALL" ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return rows.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }));
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
