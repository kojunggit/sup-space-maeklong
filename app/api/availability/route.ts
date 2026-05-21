import { NextResponse } from "next/server";

const CALENDAR_ID   = process.env.GOOGLE_CALENDAR_ID;
const CLIENT_EMAIL  = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY   = process.env.GOOGLE_PRIVATE_KEY;

// Thai time UTC+7 slot windows
const SLOTS = {
  MORNING:   { startH: 7,  endH: 11 },
  AFTERNOON: { startH: 13, endH: 17 },
};

function toLocalIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function busyOverlaps(
  busyStart: string,
  busyEnd: string,
  windowStart: Date,
  windowEnd: Date,
): boolean {
  return new Date(busyStart) < windowEnd && new Date(busyEnd) > windowStart;
}

function fallback(days = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() + i * 86_400_000);
    return { date: toLocalIso(d), morning: true, afternoon: true, available: true };
  });
}

export async function GET() {
  // Graceful fallback when Google Calendar is not configured
  if (!CALENDAR_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    return NextResponse.json(fallback(), {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  try {
    const { google } = await import("googleapis");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeMin = today.toISOString();
    const timeMax = new Date(today.getTime() + 14 * 86_400_000).toISOString();

    const fb = await calendar.freebusy.query({
      requestBody: { timeMin, timeMax, items: [{ id: CALENDAR_ID }] },
    });

    const busy = fb.data.calendars?.[CALENDAR_ID]?.busy ?? [];

    const result = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today.getTime() + i * 86_400_000);
      const iso = toLocalIso(d);

      // Build UTC times for Thai-time slots (UTC+7 = subtract 7h to get UTC)
      const slotDate = (h: number) =>
        new Date(`${iso}T${String(h).padStart(2, "0")}:00:00+07:00`);

      const morningStart = slotDate(SLOTS.MORNING.startH);
      const morningEnd   = slotDate(SLOTS.MORNING.endH);
      const afternoonStart = slotDate(SLOTS.AFTERNOON.startH);
      const afternoonEnd   = slotDate(SLOTS.AFTERNOON.endH);

      const morningBusy = busy.some(
        (b) => b.start && b.end && busyOverlaps(b.start, b.end, morningStart, morningEnd),
      );
      const afternoonBusy = busy.some(
        (b) => b.start && b.end && busyOverlaps(b.start, b.end, afternoonStart, afternoonEnd),
      );

      return {
        date: iso,
        morning:   !morningBusy,
        afternoon: !afternoonBusy,
        available: !morningBusy || !afternoonBusy,
      };
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (err) {
    console.error("Google Calendar availability error:", err);
    return NextResponse.json(fallback(), {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
}
