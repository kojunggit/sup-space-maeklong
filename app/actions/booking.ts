"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface BookingPayload {
  date: string;
  timeSlot: string;
  routeId: string;
  paddlers: number;
  weight: number;
  skillLevel: string;
  hasPhoto: boolean;
  total: number;
  guestName: string;
  guestPhone: string;
}

export interface BookingResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function createBooking(payload: BookingPayload): Promise<BookingResult> {
  try {
    const booking = await prisma.booking.create({
      data: {
        date:       payload.date,
        timeSlot:   payload.timeSlot,
        routeId:    payload.routeId,
        paddlers:   payload.paddlers,
        weight:     payload.weight,
        skillLevel: payload.skillLevel,
        hasPhoto:   payload.hasPhoto,
        total:      payload.total,
        guestName:  payload.guestName || null,
        guestPhone: payload.guestPhone || null,
        status:     "PENDING",
      },
    });
    return { ok: true, id: booking.id };
  } catch (err) {
    console.error("createBooking error:", err);
    return { ok: false, error: "ไม่สามารถบันทึกการจองได้ กรุณาลองใหม่อีกครั้ง" };
  }
}
