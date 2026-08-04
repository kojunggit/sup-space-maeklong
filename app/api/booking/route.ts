import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createBookingRecord } from "@/app/lib/booking-core";
import { checkApiKey, apiKeyEnabled } from "@/app/lib/api-auth";

const THAI_DAYS   = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
                     "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

function thaiDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${THAI_DAYS[d.getDay()]}ที่ ${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export async function POST(req: NextRequest) {
  if (!apiKeyEnabled()) {
    return NextResponse.json({ ok: false, error: "Booking API not enabled — set BOOKING_API_KEY" }, { status: 503 });
  }
  if (!checkApiKey(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const {
    dateIso, timeSlot, routeId, specialTripId, boardChoice,
    paddlers, guestName, guestPhone, guestEmail, lineUserId, notes,
  } = body;

  // ── Required field validation ─────────────────────────────────────────────
  const missing = (["dateIso", "timeSlot", "paddlers", "guestName", "guestPhone"] as const)
    .filter((k) => !body[k]);
  if (missing.length) {
    return NextResponse.json({ ok: false, error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  if (!routeId && !specialTripId) {
    return NextResponse.json({
      ok: false,
      error: "Provide routeId (regular trip) or specialTripId + boardChoice (special trip)",
    }, { status: 400 });
  }

  if (typeof dateIso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    return NextResponse.json({ ok: false, error: "dateIso must be YYYY-MM-DD" }, { status: 400 });
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  if (dateIso < todayIso) {
    return NextResponse.json({ ok: false, error: "Cannot book a past date" }, { status: 400 });
  }

  const numPaddlers = Number(paddlers);
  if (!Number.isInteger(numPaddlers) || numPaddlers < 1 || numPaddlers > 20) {
    return NextResponse.json({ ok: false, error: "paddlers must be an integer between 1 and 20" }, { status: 400 });
  }

  // ── Calculate total from DB price ─────────────────────────────────────────
  let total = 0;

  if (specialTripId) {
    const st = await prisma.specialTrip.findUnique({
      where: { id: String(specialTripId) },
      select: { rentalPrice: true, ownBoardPrice: true, status: true },
    }).catch(() => null);
    if (!st)                       return NextResponse.json({ ok: false, error: `Special trip "${specialTripId}" not found` }, { status: 400 });
    if (st.status !== "ACTIVE")    return NextResponse.json({ ok: false, error: "Special trip is no longer active" }, { status: 400 });
    total = (boardChoice === "own" ? st.ownBoardPrice : st.rentalPrice) * numPaddlers;
  } else {
    const route = await prisma.paddleRoute.findUnique({
      where: { id: String(routeId) },
      select: { price: true },
    }).catch(() => null);
    if (!route) return NextResponse.json({ ok: false, error: `Route "${routeId}" not found` }, { status: 400 });
    total = route.price * numPaddlers;
  }

  // ── Create booking (reuses all existing guards) ───────────────────────────
  const result = await createBookingRecord({
    date:            thaiDate(dateIso),
    dateIso,
    timeSlot:        String(timeSlot),
    routeId:         routeId       ? String(routeId)       : "",
    specialTripId:   specialTripId ? String(specialTripId) : undefined,
    boardChoice:     boardChoice === "own" ? "own" : "rental",
    paddlers:        numPaddlers,
    photoPermission: "allow",
    total,
    guestName:       String(guestName),
    guestPhone:      String(guestPhone),
    guestEmail:      guestEmail  ? String(guestEmail)  : undefined,
    contactChannel:  "line",
    contactId:       lineUserId  ? String(lineUserId)  : undefined,
    notes:           notes       ? String(notes)       : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
  }

  return NextResponse.json({
    ok:        true,
    bookingId: result.id,
    ref:       result.id!.slice(-8).toUpperCase(),
    status:    "PENDING",
    summary: {
      date:          thaiDate(dateIso),
      dateIso,
      timeSlot:      String(timeSlot),
      routeId:       routeId       ? String(routeId)       : null,
      specialTripId: specialTripId ? String(specialTripId) : null,
      paddlers:      numPaddlers,
      total,
    },
  }, { status: 201 });
}
