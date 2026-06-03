"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { revalidatePath } from "next/cache";
import { normalizePhone, isValidPhone, formatPhone } from "@/app/lib/phone";

function getPrisma() {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

// ─── Date helpers ───────────────────────────────────────────────────────────
const THAI_MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

/** "28 มิ.ย. 2569" — Thai short month + Buddhist year. */
function toThaiDateBE(d: Date): string {
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/** Add one calendar month, clamping end-of-month overflow (31 Jan → 28/29 Feb). */
function addOneMonth(from: Date): Date {
  const d = new Date(from);
  const day = d.getDate();
  d.setMonth(d.getMonth() + 1);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

// ─── Types ──────────────────────────────────────────────────────────────────
export type PackageType = "COUNT" | "MONTH";

export interface PackageView {
  id:           string;
  type:         PackageType;
  status:       string;
  price:        number;
  totalCount:   number | null;
  usedCount:    number;
  remaining:    number | null;     // COUNT: total - used; MONTH: null
  startDateIso: string | null;
  endDateIso:   string | null;
  endDateBE:    string | null;     // "28 มิ.ย. 2569"
  usable:       boolean;
  label:        string;            // short Thai status label
  createdAtIso: string;
}

export interface MemberView {
  id:             string;
  phone:          string;
  phoneDisplay:   string;
  name:           string;
  email:          string | null;
  channel:        string | null;
  contactId:      string | null;
  note:           string | null;
  packages:       PackageView[];
  usablePackages: PackageView[];   // ordered by priority: MONTH first, then COUNT
  totalVisits:    number;
  createdAtIso:   string;
}

export interface RecordVisitResult {
  ok:           boolean;
  outcome:      "RECORDED" | "NO_MEMBER" | "NO_QUOTA" | "EXPIRED" | "INVALID" | "ERROR";
  summary:      string;            // ready-to-display Thai message (HTML)
  memberName?:  string;
  packageType?: PackageType;
  visitNumber?: number;
  remaining?:   number;
  endDateBE?:   string;
  visitLogId?:  string;
}

// ─── Pure view helpers ────────────────────────────────────────────────────────
interface RawPackage {
  id: string; type: string; status: string; price: number;
  totalCount: number | null; usedCount: number;
  startDate: Date | null; endDate: Date | null; createdAt: Date;
}

function isUsable(p: RawPackage, now: Date): boolean {
  if (p.status === "CANCELLED") return false;
  if (p.type === "MONTH") {
    if (p.status === "EXPIRED") return false;
    if (p.startDate == null) return true;                 // pending — activates on use
    if (p.status === "ACTIVE" && p.endDate != null && p.endDate >= now) return true;
    return false;
  }
  // COUNT
  return p.status === "ACTIVE" && p.usedCount < (p.totalCount ?? 0);
}

function toPackageView(p: RawPackage, now: Date): PackageView {
  const usable = isUsable(p, now);
  const remaining = p.type === "COUNT" ? Math.max(0, (p.totalCount ?? 0) - p.usedCount) : null;
  const endDateBE = p.endDate ? toThaiDateBE(p.endDate) : null;

  let label: string;
  if (p.status === "CANCELLED") {
    label = p.type === "MONTH" ? "แพครายเดือน · ยกเลิกแล้ว" : "แพค 10 ครั้ง · ยกเลิกแล้ว";
  } else if (p.type === "MONTH") {
    if (p.startDate == null) label = "แพครายเดือน · ยังไม่เริ่มใช้";
    else if (usable)         label = `แพครายเดือน · ใช้ได้ถึง ${endDateBE}`;
    else                     label = `แพครายเดือน · หมดอายุแล้ว (${endDateBE})`;
  } else {
    label = remaining && remaining > 0
      ? `แพค 10 ครั้ง · เหลือ ${remaining}/${p.totalCount} ครั้ง`
      : "แพค 10 ครั้ง · ใช้ครบแล้ว";
  }

  return {
    id: p.id, type: p.type as PackageType, status: p.status, price: p.price,
    totalCount: p.totalCount, usedCount: p.usedCount, remaining,
    startDateIso: p.startDate?.toISOString() ?? null,
    endDateIso:   p.endDate?.toISOString() ?? null,
    endDateBE, usable, label,
    createdAtIso: p.createdAt.toISOString(),
  };
}

/** Order usable packages by consumption priority: running MONTH → pending MONTH → COUNT (oldest first). */
function orderUsable(views: PackageView[]): PackageView[] {
  const rank = (v: PackageView) => {
    if (v.type === "MONTH" && v.startDateIso) return 0;   // running monthly
    if (v.type === "MONTH")                   return 1;   // pending monthly
    return 2;                                             // count
  };
  return views.filter((v) => v.usable).sort((a, b) =>
    rank(a) - rank(b) || a.createdAtIso.localeCompare(b.createdAtIso));
}

interface MemberRow {
  id: string; phone: string; name: string; email: string | null;
  channel: string | null; contactId: string | null; note: string | null;
  createdAt: Date; packages: RawPackage[]; visits: { id: string }[];
}

function toMemberView(m: MemberRow): MemberView {
  const now = new Date();
  const packages = m.packages
    .map((p) => toPackageView(p, now))
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  return {
    id: m.id, phone: m.phone, phoneDisplay: formatPhone(m.phone), name: m.name,
    email: m.email, channel: m.channel, contactId: m.contactId, note: m.note,
    packages,
    usablePackages: orderUsable(packages),
    totalVisits: m.visits.length,
    createdAtIso: m.createdAt.toISOString(),
  };
}

const memberInclude = {
  packages: true,
  visits: { where: { voided: false }, select: { id: true } },
} as const;

// ─── Reads ────────────────────────────────────────────────────────────────────
export async function listMembers(query?: string): Promise<MemberView[]> {
  const prisma = getPrisma();
  try {
    const q = (query ?? "").trim();
    const where = q
      ? { OR: [
          { name:  { contains: q, mode: "insensitive" as const } },
          { phone: { contains: normalizePhone(q) || q } },
        ] }
      : undefined;
    const rows = await (prisma as any).member.findMany({
      where,
      include: memberInclude,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return rows.map((r: MemberRow) => toMemberView(r));
  } catch (err) {
    console.error("listMembers error:", err);
    return [];
  }
}

export async function getMemberByPhone(rawPhone: string): Promise<MemberView | null> {
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) return null;
  const prisma = getPrisma();
  try {
    const row = await (prisma as any).member.findUnique({
      where: { phone },
      include: memberInclude,
    });
    return row ? toMemberView(row) : null;
  } catch (err) {
    console.error("getMemberByPhone error:", err);
    return null;
  }
}

export async function getMemberVisits(memberId: string): Promise<Array<{
  id: string; packageType: string; visitNumber: number | null; via: string; createdAtIso: string;
}>> {
  const prisma = getPrisma();
  try {
    const rows = await (prisma as any).visitLog.findMany({
      where: { memberId, voided: false },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((r: any) => ({
      id: r.id, packageType: r.packageType, visitNumber: r.visitNumber,
      via: r.via, createdAtIso: r.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("getMemberVisits error:", err);
    return [];
  }
}

// ─── Member CRUD ────────────────────────────────────────────────────────────
export interface CreateMemberInput {
  name: string; phone: string; email?: string; channel?: string; contactId?: string; note?: string;
  initialPackage?: PackageType;
}

const PACKAGE_PRICE: Record<PackageType, number> = { COUNT: 2900, MONTH: 3500 };

function packageCreateData(type: PackageType) {
  return type === "COUNT"
    ? { type, status: "ACTIVE", price: PACKAGE_PRICE.COUNT, totalCount: 10, usedCount: 0 }
    : { type, status: "PENDING", price: PACKAGE_PRICE.MONTH, totalCount: null, usedCount: 0 };
}

export async function createMember(input: CreateMemberInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  if (!name) return { ok: false, error: "กรุณากรอกชื่อสมาชิก" };
  if (!isValidPhone(phone)) return { ok: false, error: "เบอร์โทรไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)" };

  const prisma = getPrisma();
  try {
    const existing = await (prisma as any).member.findUnique({ where: { phone } });
    if (existing) return { ok: false, error: `มีสมาชิกเบอร์ ${formatPhone(phone)} อยู่แล้ว` };

    const member = await (prisma as any).member.create({
      data: {
        name, phone,
        email:     input.email?.trim() || null,
        channel:   input.channel?.trim() || null,
        contactId: input.contactId?.trim() || null,
        note:      input.note?.trim() || null,
        packages:  input.initialPackage ? { create: packageCreateData(input.initialPackage) } : undefined,
      },
    });
    revalidatePath("/admin");
    return { ok: true, id: member.id };
  } catch (err) {
    console.error("createMember error:", err);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateMember(
  id: string,
  patch: { name?: string; email?: string; channel?: string; contactId?: string; note?: string },
): Promise<{ ok: boolean; error?: string }> {
  const prisma = getPrisma();
  try {
    await (prisma as any).member.update({
      where: { id },
      data: {
        ...(patch.name      !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.email     !== undefined ? { email: patch.email.trim() || null } : {}),
        ...(patch.channel   !== undefined ? { channel: patch.channel.trim() || null } : {}),
        ...(patch.contactId !== undefined ? { contactId: patch.contactId.trim() || null } : {}),
        ...(patch.note      !== undefined ? { note: patch.note.trim() || null } : {}),
      },
    });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("updateMember error:", err);
    return { ok: false, error: "แก้ไขไม่สำเร็จ" };
  }
}

// ─── Packages ─────────────────────────────────────────────────────────────────
export async function addPackage(memberId: string, type: PackageType): Promise<{ ok: boolean; error?: string }> {
  const prisma = getPrisma();
  try {
    await (prisma as any).memberPackage.create({ data: { memberId, ...packageCreateData(type) } });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("addPackage error:", err);
    return { ok: false, error: "เพิ่มแพคเกจไม่สำเร็จ" };
  }
}

export async function cancelPackage(packageId: string): Promise<{ ok: boolean }> {
  const prisma = getPrisma();
  try {
    await (prisma as any).memberPackage.update({ where: { id: packageId }, data: { status: "CANCELLED" } });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("cancelPackage error:", err);
    return { ok: false };
  }
}

// ─── Core: record a visit ──────────────────────────────────────────────────────
export async function recordVisit(args: {
  memberId?: string; phone?: string; packageId?: string; via?: string;
}): Promise<RecordVisitResult> {
  const via = args.via ?? "telegram";
  const prisma = getPrisma();

  try {
    return await prisma.$transaction(async (tx) => {
      const t = tx as any;

      // Resolve member (by id, phone, or — for Telegram callbacks — via the package)
      let where: { id: string } | { phone: string };
      if (args.memberId) {
        where = { id: args.memberId };
      } else if (args.phone) {
        const ph = normalizePhone(args.phone);
        if (!isValidPhone(ph)) {
          return { ok: false, outcome: "INVALID", summary: "❌ เบอร์โทรไม่ถูกต้อง" } as RecordVisitResult;
        }
        where = { phone: ph };
      } else if (args.packageId) {
        const pkg = await t.memberPackage.findUnique({ where: { id: args.packageId } });
        if (!pkg) {
          return { ok: false, outcome: "ERROR", summary: "⚠️ ไม่พบแพคเกจที่เลือก" } as RecordVisitResult;
        }
        where = { id: pkg.memberId };
      } else {
        return { ok: false, outcome: "INVALID", summary: "❌ ข้อมูลไม่ครบ" } as RecordVisitResult;
      }
      const member = await t.member.findUnique({ where, include: { packages: true } });
      if (!member) {
        return { ok: false, outcome: "NO_MEMBER",
          summary: `❌ ไม่พบสมาชิกเบอร์ ${formatPhone((where as any).phone ?? "")}` } as RecordVisitResult;
      }

      const now = new Date();
      const pkgs: RawPackage[] = member.packages;

      // Choose target package
      let target: RawPackage | undefined;
      if (args.packageId) {
        target = pkgs.find((p) => p.id === args.packageId);
        if (!target) {
          return { ok: false, outcome: "ERROR", memberName: member.name,
            summary: `⚠️ ไม่พบแพคเกจที่เลือก` } as RecordVisitResult;
        }
        if (!isUsable(target, now)) {
          const expired = target.type === "MONTH" && target.startDate != null;
          return { ok: false, outcome: expired ? "EXPIRED" : "NO_QUOTA", memberName: member.name,
            summary: expired
              ? `⛔ <b>${member.name}</b> แพครายเดือนหมดอายุแล้ว`
              : `⛔ <b>${member.name}</b> แพคเกจนี้ใช้ไม่ได้แล้ว` } as RecordVisitResult;
        }
      } else {
        const ordered = orderUsable(pkgs.map((p) => toPackageView(p, now)));
        const first = ordered[0];
        target = first ? pkgs.find((p) => p.id === first.id) : undefined;
        if (!target) {
          return { ok: false, outcome: "NO_QUOTA", memberName: member.name,
            summary: `⛔ <b>${member.name}</b> ไม่มีสิทธิ์คงเหลือ\nกรุณาต่อแพคเกจ` } as RecordVisitResult;
        }
      }

      // Apply
      if (target.type === "MONTH") {
        let endDate = target.endDate;
        if (target.startDate == null) {
          // First use → activate now
          endDate = addOneMonth(now);
          await t.memberPackage.update({
            where: { id: target.id },
            data: { startDate: now, endDate, status: "ACTIVE" },
          });
        } else if (endDate != null && now > endDate) {
          await t.memberPackage.update({ where: { id: target.id }, data: { status: "EXPIRED" } });
          return { ok: false, outcome: "EXPIRED", memberName: member.name,
            summary: `⛔ <b>${member.name}</b> แพครายเดือนหมดอายุแล้ว (หมดเมื่อ ${toThaiDateBE(endDate)})` } as RecordVisitResult;
        }
        const log = await t.visitLog.create({
          data: { memberId: member.id, packageId: target.id, packageType: "MONTH", via },
        });
        const endBE = endDate ? toThaiDateBE(endDate) : "";
        const firstUse = target.startDate == null;
        revalidatePath("/admin");
        return {
          ok: true, outcome: "RECORDED", memberName: member.name, packageType: "MONTH",
          endDateBE: endBE, visitLogId: log.id,
          summary: firstUse
            ? `✅ <b>${member.name}</b>\nเริ่มใช้แพครายเดือนวันนี้ 🎉\nใช้ได้ไม่จำกัดถึง <b>${endBE}</b>`
            : `✅ <b>${member.name}</b>\nบันทึกการมาแล้ว (แพครายเดือน)\nใช้ได้ถึง <b>${endBE}</b>`,
        } as RecordVisitResult;
      }

      // COUNT — atomic guarded decrement
      const upd = await t.memberPackage.updateMany({
        where: { id: target.id, status: "ACTIVE", usedCount: { lt: target.totalCount ?? 0 } },
        data: { usedCount: { increment: 1 } },
      });
      if (upd.count === 0) {
        return { ok: false, outcome: "NO_QUOTA", memberName: member.name,
          summary: `⛔ <b>${member.name}</b> แพค 10 ครั้งใช้ครบแล้ว\nกรุณาต่อแพคเกจ` } as RecordVisitResult;
      }
      const newUsed = target.usedCount + 1;
      const total = target.totalCount ?? 10;
      const remaining = Math.max(0, total - newUsed);
      if (remaining === 0) {
        await t.memberPackage.update({ where: { id: target.id }, data: { status: "USED_UP" } });
      }
      const log = await t.visitLog.create({
        data: { memberId: member.id, packageId: target.id, packageType: "COUNT", visitNumber: newUsed, via },
      });
      revalidatePath("/admin");
      return {
        ok: true, outcome: "RECORDED", memberName: member.name, packageType: "COUNT",
        visitNumber: newUsed, remaining, visitLogId: log.id,
        summary: remaining > 0
          ? `✅ <b>${member.name}</b>\nบันทึกการมาครั้งที่ <b>${newUsed}</b> แล้ว\nเหลืออีก <b>${remaining}</b> ครั้ง (จาก ${total})`
          : `✅ <b>${member.name}</b>\nบันทึกการมาครั้งที่ <b>${newUsed}</b> แล้ว\n⚠️ ใช้ครบ ${total} ครั้งแล้ว — แพคนี้หมดสิทธิ์`,
      } as RecordVisitResult;
    });
  } catch (err) {
    console.error("recordVisit error:", err);
    return { ok: false, outcome: "ERROR", summary: "⚠️ เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}

// ─── Undo a visit (mistaken entry) ──────────────────────────────────────────────
export async function undoVisit(visitLogId: string): Promise<{ ok: boolean }> {
  const prisma = getPrisma();
  try {
    return await prisma.$transaction(async (tx) => {
      const t = tx as any;
      const log = await t.visitLog.findUnique({ where: { id: visitLogId } });
      if (!log || log.voided) return { ok: false };
      await t.visitLog.update({ where: { id: visitLogId }, data: { voided: true } });

      const pkg = await t.memberPackage.findUnique({ where: { id: log.packageId } });
      if (pkg) {
        if (pkg.type === "COUNT") {
          await t.memberPackage.update({
            where: { id: pkg.id },
            data: { usedCount: Math.max(0, pkg.usedCount - 1), status: "ACTIVE" },
          });
        } else {
          // MONTH: if this was the only (activating) visit, revert to pending
          const remainingVisits = await t.visitLog.count({
            where: { packageId: pkg.id, voided: false },
          });
          if (remainingVisits === 0) {
            await t.memberPackage.update({
              where: { id: pkg.id },
              data: { startDate: null, endDate: null, status: "PENDING" },
            });
          }
        }
      }
      revalidatePath("/admin");
      return { ok: true };
    });
  } catch (err) {
    console.error("undoVisit error:", err);
    return { ok: false };
  }
}
