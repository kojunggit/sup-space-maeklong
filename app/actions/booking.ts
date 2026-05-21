"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getPrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_PRISMA_URL! });
  return new PrismaClient({ adapter });
}

export interface BookingPayload {
  date: string;
  timeSlot: string;
  routeId: string;
  paddlers: number;
  weight: number;
  skillLevel: string;
  photoPermission: string;   // "allow" | "notAllow" | "private"
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
        hasPhoto:        payload.photoPermission === "private",
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
