"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { revalidatePath } from "next/cache";

function getPrisma() {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

const THAI_DAYS_SHORT   = ["อา", "จ.", "อ.", "พ.", "พฤ", "ศ.", "ส."];
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function toThaiDate(dateIso: string): string {
  const d = new Date(dateIso + "T00:00:00");
  return `${THAI_DAYS_SHORT[d.getDay()]} ${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

export interface SpecialTripPayload {
  name:          string;
  description?:  string;
  rentalPrice:   number;
  ownBoardPrice: number;
  dateIso:       string;
  timeSlot:      string;
  location:      string;
  maxBoards:     number;
}

export interface SpecialTripRecord {
  id:            string;
  name:          string;
  description:   string | null;
  rentalPrice:   number;
  ownBoardPrice: number;
  dateIso:       string;
  date:          string;
  timeSlot:      string;
  location:      string;
  maxBoards:     number;
  status:        string;
  createdAt:     string;
}

export async function createSpecialTrip(
  payload: SpecialTripPayload,
): Promise<{ ok: boolean; id?: string }> {
  if (!payload.name.trim() || !payload.dateIso || !payload.timeSlot || !payload.location.trim()) {
    return { ok: false };
  }
  const prisma = getPrisma();
  try {
    const trip = await (prisma as any).specialTrip.create({
      data: {
        name:          payload.name.trim(),
        description:   payload.description?.trim() || null,
        rentalPrice:   payload.rentalPrice,
        ownBoardPrice: payload.ownBoardPrice,
        dateIso:       payload.dateIso,
        date:          toThaiDate(payload.dateIso),
        timeSlot:      payload.timeSlot,
        location:      payload.location.trim(),
        maxBoards:     payload.maxBoards,
        status:        "ACTIVE",
      },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, id: trip.id };
  } catch (err) {
    console.error("createSpecialTrip error:", err);
    return { ok: false };
  }
}

export async function getSpecialTrips(): Promise<SpecialTripRecord[]> {
  const prisma = getPrisma();
  try {
    const rows = await (prisma as any).specialTrip.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r: any) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  } catch (err) {
    console.error("getSpecialTrips error:", err);
    return [];
  }
}

export async function getActiveSpecialTrips(): Promise<SpecialTripRecord[]> {
  const prisma = getPrisma();
  const todayIso = new Date().toISOString().slice(0, 10);
  try {
    const rows = await (prisma as any).specialTrip.findMany({
      where: {
        status:  "ACTIVE",
        dateIso: { gte: todayIso },
      },
      orderBy: [{ dateIso: "asc" }, { timeSlot: "asc" }],
    });
    return rows.map((r: any) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  } catch (err) {
    console.error("getActiveSpecialTrips error:", err);
    return [];
  }
}

export async function cancelSpecialTrip(id: string): Promise<{ ok: boolean }> {
  const prisma = getPrisma();
  try {
    await (prisma as any).specialTrip.update({
      where:  { id },
      data:   { status: "CANCELLED" },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("cancelSpecialTrip error:", err);
    return { ok: false };
  }
}
