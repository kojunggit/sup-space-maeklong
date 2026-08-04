"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { normalizePhone, isValidPhone, formatPhone } from "@/app/lib/phone";
import {
  fetchGoGreenSheet,
  BOAT_CATEGORY_LABEL,
  GROUP_TYPE_LABEL,
  BOAT_NUMBER_START,
  WALKIN_BOAT_OPTIONS,
  type BoatCategory,
  type GroupType,
} from "@/app/gogreen/lib/sheet";
import type { Prisma } from "@prisma/client";

const BOAT_CATEGORIES: BoatCategory[] = ["own", "kayak1", "kayak2", "sup", "other"];

/** Cache revalidation is a side effect — never let it turn a successful DB write into a reported failure. */
function safeRevalidate() {
  try {
    revalidatePath("/gogreen");
    revalidatePath("/gogreen/list");
    revalidatePath("/gogreen/trash");
  } catch (err) {
    console.error("safeRevalidate error:", err);
  }
}

/**
 * Assigns the next sequential boat number for a numbered category (kayak1
 * starts at 101, kayak2 at 201), shared across sheet-matched and walk-in
 * registrants alike. Must run inside a transaction with the row create so
 * two near-simultaneous check-ins for the same category can't collide.
 */
async function nextBoatNumber(
  tx: Prisma.TransactionClient,
  category: BoatCategory,
): Promise<number | null> {
  const start = BOAT_NUMBER_START[category];
  if (start === undefined) return null;
  const last = await tx.goGreenRegistration.aggregate({
    where: { boatType: category, boatNumber: { not: null } },
    _max: { boatNumber: true },
  });
  return last._max.boatNumber ? last._max.boatNumber + 1 : start;
}

export interface GoGreenBoatBreakdown {
  category: BoatCategory;
  label: string;
  count: number;
}

export interface GoGreenGroupBreakdown {
  groupType: GroupType;
  label: string;
  count: number;
}

export interface GoGreenRegistrant {
  name: string;
  phone: string;
  groupType: GroupType;
  groupLabel: string;
  boatCategory: BoatCategory;
  boatLabel: string;
  boatNumber: number | null;
  organization: string | null;
  note: string | null;
  isWalkIn: boolean;
  checkedIn: boolean;
  checkedInAt: string | null;
}

export interface GoGreenData {
  fetchedAt: string;
  totalRegistered: number;
  totalFromSheet: number;
  checkedInCount: number;
  remainingCount: number;
  walkInCount: number;
  boatBreakdown: GoGreenBoatBreakdown[];
  boatCheckedInBreakdown: GoGreenBoatBreakdown[];
  groupBreakdown: GoGreenGroupBreakdown[];
  registrants: GoGreenRegistrant[];
}

export async function getGoGreenData(): Promise<GoGreenData> {
  const [sheet, registrations] = await Promise.all([
    fetchGoGreenSheet(),
    prisma.goGreenRegistration.findMany(),
  ]);

  const checkinByPhone = new Map(registrations.map((r) => [r.phone, r]));

  // Everyone in the Sheet is a paddler — walk-ins are the only ones who can be "event"-only.
  const registrantRows: GoGreenRegistrant[] = sheet.map((r) => {
    const reg = checkinByPhone.get(r.phone);
    return {
      name: r.name,
      phone: formatPhone(r.phone),
      groupType: "paddle",
      groupLabel: GROUP_TYPE_LABEL.paddle,
      boatCategory: r.boatCategory,
      boatLabel: BOAT_CATEGORY_LABEL[r.boatCategory],
      boatNumber: reg?.boatNumber ?? null,
      organization: reg?.organization ?? null,
      note: reg?.note ?? null,
      isWalkIn: false,
      checkedIn: !!reg,
      checkedInAt: reg ? reg.checkedInAt.toISOString() : null,
    };
  });

  const walkInRows: GoGreenRegistrant[] = registrations
    .filter((r) => r.isWalkIn)
    .map((r) => {
      const groupType = (r.groupType as GroupType) ?? "paddle";
      return {
        name: r.name,
        phone: formatPhone(r.phone),
        groupType,
        groupLabel: GROUP_TYPE_LABEL[groupType] ?? r.groupType,
        boatCategory: (r.boatType as BoatCategory) ?? "other",
        boatLabel: BOAT_CATEGORY_LABEL[r.boatType as BoatCategory] ?? r.boatType,
        boatNumber: r.boatNumber,
        organization: r.organization,
        note: r.note,
        isWalkIn: true,
        checkedIn: true,
        checkedInAt: r.checkedInAt.toISOString(),
      };
    });

  const allRows = [...registrantRows, ...walkInRows];
  const checkedInFromSheet = registrantRows.filter((r) => r.checkedIn).length;

  const boatBreakdown: GoGreenBoatBreakdown[] = BOAT_CATEGORIES.map((category) => ({
    category,
    label: BOAT_CATEGORY_LABEL[category],
    count: sheet.filter((r) => r.boatCategory === category).length,
  })).filter((b) => b.count > 0);

  const boatCheckedInBreakdown: GoGreenBoatBreakdown[] = BOAT_CATEGORIES.map((category) => ({
    category,
    label: BOAT_CATEGORY_LABEL[category],
    count: allRows.filter((r) => r.checkedIn && r.boatCategory === category).length,
  })).filter((b) => b.count > 0);

  const groupBreakdown: GoGreenGroupBreakdown[] = (["paddle", "event"] as GroupType[])
    .map((groupType) => ({
      groupType,
      label: GROUP_TYPE_LABEL[groupType],
      count: allRows.filter((r) => r.checkedIn && r.groupType === groupType).length,
    }))
    .filter((g) => g.count > 0);

  return {
    fetchedAt: new Date().toISOString(),
    totalRegistered: sheet.length + walkInRows.length,
    totalFromSheet: sheet.length,
    checkedInCount: checkedInFromSheet + walkInRows.length,
    remainingCount: sheet.length - checkedInFromSheet,
    walkInCount: walkInRows.length,
    boatBreakdown,
    boatCheckedInBreakdown,
    groupBreakdown,
    registrants: allRows,
  };
}

export type CheckInResult =
  | {
      ok: true;
      matched: true;
      alreadyCheckedIn: boolean;
      name: string;
      boatLabel: string;
      boatNumber: number | null;
    }
  | { ok: true; matched: false }
  | { ok: false; error: string };

/** Looks up a phone number against the Sheet and checks the person in if found. */
export async function checkInByPhone(rawPhone: string): Promise<CheckInResult> {
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) {
    return { ok: false, error: "เบอร์โทรไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)" };
  }

  try {
    const sheet = await fetchGoGreenSheet();
    const match = sheet.find((r) => r.phone === phone);
    if (!match) {
      return { ok: true, matched: false };
    }

    const existing = await prisma.goGreenRegistration.findUnique({ where: { phone } });
    if (existing) {
      return {
        ok: true,
        matched: true,
        alreadyCheckedIn: true,
        name: existing.name,
        boatLabel: BOAT_CATEGORY_LABEL[existing.boatType as BoatCategory] ?? existing.boatType,
        boatNumber: existing.boatNumber,
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      const boatNumber = await nextBoatNumber(tx, match.boatCategory);
      return tx.goGreenRegistration.create({
        data: {
          phone,
          name: match.name,
          groupType: "paddle",
          boatType: match.boatCategory,
          boatNumber,
          isWalkIn: false,
        },
      });
    });
    safeRevalidate();
    return {
      ok: true,
      matched: true,
      alreadyCheckedIn: false,
      name: created.name,
      boatLabel: BOAT_CATEGORY_LABEL[created.boatType as BoatCategory],
      boatNumber: created.boatNumber,
    };
  } catch (err) {
    console.error("checkInByPhone error:", err);
    return { ok: false, error: "ไม่สามารถเช็คอินได้ กรุณาลองใหม่อีกครั้ง" };
  }
}

export type WalkInResult =
  | {
      ok: true;
      alreadyCheckedIn: boolean;
      name: string;
      groupLabel: string;
      boatLabel: string;
      boatNumber: number | null;
    }
  | { ok: false; error: string };

export interface WalkInPayload {
  phone: string;
  name: string;
  groupType: GroupType;
  boatCategory: BoatCategory; // only meaningful when groupType === "paddle"
  organization: string;
  note: string;
}

/** Registers someone who wasn't found in the Sheet (on-site walk-in). */
export async function submitWalkIn(payload: WalkInPayload): Promise<WalkInResult> {
  const phone = normalizePhone(payload.phone);
  const name = payload.name.trim();
  const organization = payload.organization.trim();
  const note = payload.note.trim();

  if (!isValidPhone(phone)) {
    return { ok: false, error: "เบอร์โทรไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)" };
  }
  if (!name) {
    return { ok: false, error: "กรุณากรอกชื่อ-นามสกุล" };
  }
  if (payload.groupType !== "paddle" && payload.groupType !== "event") {
    return { ok: false, error: "กรุณาเลือกประเภทผู้ลงทะเบียน" };
  }
  const isPaddler = payload.groupType === "paddle";
  if (isPaddler && !WALKIN_BOAT_OPTIONS.includes(payload.boatCategory)) {
    return { ok: false, error: "กรุณาเลือกประเภทเรือ" };
  }
  const boatCategory: BoatCategory = isPaddler ? payload.boatCategory : "none";

  try {
    const existing = await prisma.goGreenRegistration.findUnique({ where: { phone } });
    if (existing) {
      const groupType = (existing.groupType as GroupType) ?? "paddle";
      return {
        ok: true,
        alreadyCheckedIn: true,
        name: existing.name,
        groupLabel: GROUP_TYPE_LABEL[groupType] ?? existing.groupType,
        boatLabel: BOAT_CATEGORY_LABEL[existing.boatType as BoatCategory] ?? existing.boatType,
        boatNumber: existing.boatNumber,
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      const boatNumber = await nextBoatNumber(tx, boatCategory);
      return tx.goGreenRegistration.create({
        data: {
          phone,
          name,
          groupType: payload.groupType,
          boatType: boatCategory,
          boatNumber,
          organization: organization || null,
          note: note || null,
          isWalkIn: true,
        },
      });
    });
    safeRevalidate();
    return {
      ok: true,
      alreadyCheckedIn: false,
      name: created.name,
      groupLabel: GROUP_TYPE_LABEL[payload.groupType],
      boatLabel: BOAT_CATEGORY_LABEL[created.boatType as BoatCategory],
      boatNumber: created.boatNumber,
    };
  } catch (err) {
    console.error("submitWalkIn error:", err);
    return { ok: false, error: "ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง" };
  }
}

// ─── Trash weigh-in leaderboard ─────────────────────────────────────────────
// Recorded post-paddle, against a phone number that must already be checked
// in as a paddler. Only paddlers show up in the leaderboard / full list.

export interface TrashLeaderboardEntry {
  rank: number; // 0 = not yet weighed
  name: string;
  phone: string;
  weightKg: number | null;
}

export interface TrashLeaderboardData {
  fetchedAt: string;
  top10: TrashLeaderboardEntry[];
  all: TrashLeaderboardEntry[];
  weighedCount: number;
  totalPaddlers: number;
}

export async function getTrashLeaderboard(): Promise<TrashLeaderboardData> {
  const rows = await prisma.goGreenRegistration.findMany({ where: { groupType: "paddle" } });

  const weighed = rows
    .filter((r) => r.trashWeightKg != null)
    .sort((a, b) => (b.trashWeightKg as number) - (a.trashWeightKg as number));
  const unweighed = rows
    .filter((r) => r.trashWeightKg == null)
    .sort((a, b) => a.name.localeCompare(b.name, "th"));

  const ranked: TrashLeaderboardEntry[] = weighed.map((r, i) => ({
    rank: i + 1,
    name: r.name,
    phone: formatPhone(r.phone),
    weightKg: r.trashWeightKg,
  }));
  const notYetWeighed: TrashLeaderboardEntry[] = unweighed.map((r) => ({
    rank: 0,
    name: r.name,
    phone: formatPhone(r.phone),
    weightKg: null,
  }));

  return {
    fetchedAt: new Date().toISOString(),
    top10: ranked.slice(0, 10),
    all: [...ranked, ...notYetWeighed],
    weighedCount: ranked.length,
    totalPaddlers: rows.length,
  };
}

export type TrashWeightResult =
  | { ok: true; name: string; weightKg: number; previousWeightKg: number | null }
  | { ok: false; error: string };

/** Records (or corrects) the trash weight collected by an already-checked-in paddler. */
export async function recordTrashWeight(rawPhone: string, weightKg: number): Promise<TrashWeightResult> {
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) {
    return { ok: false, error: "เบอร์โทรไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)" };
  }
  if (!Number.isFinite(weightKg) || weightKg < 0) {
    return { ok: false, error: "กรุณากรอกน้ำหนักขยะเป็นตัวเลข (กก.)" };
  }

  try {
    const existing = await prisma.goGreenRegistration.findUnique({ where: { phone } });
    if (!existing) {
      return { ok: false, error: "ไม่พบผู้ลงทะเบียนด้วยเบอร์นี้ — กรุณาเช็คอินที่หน้าลงทะเบียนก่อน" };
    }
    if (existing.groupType !== "paddle") {
      return { ok: false, error: "เบอร์นี้ลงทะเบียนเป็นผู้ร่วมงาน (ไม่ได้พายเรือ) จึงบันทึกน้ำหนักขยะไม่ได้" };
    }

    const previousWeightKg = existing.trashWeightKg;
    const updated = await prisma.goGreenRegistration.update({
      where: { phone },
      data: { trashWeightKg: weightKg },
    });
    safeRevalidate();
    return {
      ok: true,
      name: updated.name,
      weightKg: updated.trashWeightKg as number,
      previousWeightKg,
    };
  } catch (err) {
    console.error("recordTrashWeight error:", err);
    return { ok: false, error: "ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง" };
  }
}
