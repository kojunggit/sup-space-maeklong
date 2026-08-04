import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { isHourClosed, type ClosedSlotShape } from "@/app/_components/trips-data";
import { sendTelegramNotification, buildBookingMessage } from "@/app/lib/telegram-notify";
import { readTelegramConfig } from "@/app/lib/telegram-config";
import { sendBookingConfirmationEmail } from "@/app/lib/email-notify";
import {
  CLOSED_TRIPS_SETTING_KEY,
  parseClosedTripKeys,
  regularTripKey,
  specialTripKey,
} from "@/app/lib/trip-closure";

function parseHour(slot: string): number | null {
  const n = parseInt(slot.split(":")[0], 10);
  return isNaN(n) ? null : n;
}

export interface BookingPayload {
  date: string;
  dateIso?: string;
  timeSlot: string;
  routeId: string;
  paddlers: number;
  photoPermission: string;
  total: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  contactChannel?: string;
  contactId?: string;
  pickupAddress?: string;
  notes?: string;
  promoCode?: string;
  specialTripId?: string;
  boardChoice?: "rental" | "own";
}

export interface BookingResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function createBookingRecord(payload: BookingPayload): Promise<BookingResult> {
  try {
    // Guard 0: admin may close one existing trip to make it private. This is
    // checked in the shared writer so browser forms and external APIs agree.
    const closedTripsRow = await prisma.setting.findUnique({
      where: { key: CLOSED_TRIPS_SETTING_KEY },
      select: { value: true },
    }).catch(() => null);
    const closedTripKeys = parseClosedTripKeys(closedTripsRow?.value);
    const tripKey = payload.specialTripId
      ? specialTripKey(payload.specialTripId)
      : payload.dateIso && payload.routeId
        ? regularTripKey(payload.dateIso, payload.timeSlot, payload.routeId)
        : null;
    if (tripKey && closedTripKeys.has(tripKey)) {
      return { ok: false, error: "ทริปนี้ปิดรับจองเพิ่มเติมแล้ว กรุณาเลือกทริปอื่น" };
    }

    // Guard 1: no duplicate (same phone + date + time, not cancelled)
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
      if (dup) return { ok: false, error: "คุณมีการจองในวันและเวลานี้อยู่แล้ว กรุณาตรวจสอบการจองของคุณ" };
    }

    // Guard 2: slot not in closed list
    if (payload.dateIso) {
      const closedRow = await prisma.setting.findUnique({ where: { key: "closedSlots" } }).catch(() => null);
      if (closedRow) {
        const closed = JSON.parse(closedRow.value) as ClosedSlotShape[];
        if (isHourClosed(closed, payload.dateIso, payload.timeSlot)) {
          return { ok: false, error: "วันและเวลานี้ปิดให้บริการ กรุณาเลือกวันหรือเวลาอื่น" };
        }
      }
    }

    // Guard 3: duration-overlap check (special trips bypass)
    const newStartHour = parseHour(payload.timeSlot);
    if (!payload.specialTripId && newStartHour !== null && payload.dateIso) {
      const newRouteRow = payload.routeId
        ? await prisma.paddleRoute.findUnique({ where: { id: payload.routeId }, select: { duration: true } }).catch(() => null)
        : null;
      const newDuration = newRouteRow?.duration ?? 2;
      const newEnd = newStartHour + newDuration - 1;

      const sameDayBookings = await prisma.booking.findMany({
        where: { dateIso: payload.dateIso, status: { not: "CANCELLED" } },
        select: { timeSlot: true, routeId: true },
      });

      const routeIds = [...new Set(sameDayBookings.map((b) => b.routeId).filter(Boolean) as string[])];
      const routeRows = routeIds.length > 0
        ? await prisma.paddleRoute.findMany({ where: { id: { in: routeIds } }, select: { id: true, duration: true } })
        : [];
      const durationMap = Object.fromEntries(routeRows.map((r) => [r.id, r.duration]));

      for (const eb of sameDayBookings) {
        const ebStart = parseHour(eb.timeSlot);
        if (ebStart === null) continue;
        if (ebStart === newStartHour && eb.routeId === payload.routeId) continue;
        const ebDuration = (eb.routeId ? durationMap[eb.routeId] : null) ?? 2;
        const ebEnd = ebStart + ebDuration - 1;
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
        routeId:         payload.routeId || null,
        specialTripId:   payload.specialTripId || null,
        boardChoice:     payload.boardChoice || null,
        paddlers:        payload.paddlers,
        hasPhoto:        payload.photoPermission !== "notAllow",
        photoPermission: payload.photoPermission,
        total:           payload.total,
        guestName:       payload.guestName || null,
        guestPhone:      payload.guestPhone || null,
        guestEmail:      payload.guestEmail || null,
        contactChannel:  payload.contactChannel || null,
        contactId:       payload.contactId || null,
        pickupAddress:   payload.pickupAddress || null,
        notes:           payload.notes || null,
        promoCode:       payload.promoCode || null,
        status:          "PENDING",
      },
    });

    const tgConfig = await readTelegramConfig();
    if (tgConfig) {
      const routeRow = booking.routeId
        ? await prisma.paddleRoute.findUnique({ where: { id: booking.routeId }, select: { name: true } }).catch(() => null)
        : null;
      void sendTelegramNotification(buildBookingMessage(booking, routeRow?.name), tgConfig.token, tgConfig.chatId);
    }
    void sendBookingConfirmationEmail(booking);
    revalidatePath("/");
    return { ok: true, id: booking.id };
  } catch (err) {
    console.error("createBookingRecord error:", err);
    return { ok: false, error: "ไม่สามารถบันทึกการจองได้ กรุณาลองใหม่อีกครั้ง" };
  }
}
