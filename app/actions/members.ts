"use server";

// Admin-facing server actions for the membership UI. Each wrapper enforces admin
// auth and then delegates to the core logic in `@/app/lib/members-core`.
//
// Note: `getMemberByPhone` is deliberately NOT re-exported here — exposing a
// phone→PII lookup as a public endpoint would let anyone enumerate members. The
// only non-admin caller is the Telegram webhook (gated by its own secret), which
// imports it directly from the core module.

import { assertAdmin } from "@/app/lib/auth";
import * as core from "@/app/lib/members-core";

export type {
  PackageType, PackageView, MemberView, RecordVisitResult, CreateMemberInput,
} from "@/app/lib/members-core";

export async function listMembers(query?: string) {
  await assertAdmin();
  return core.listMembers(query);
}

export async function getMemberVisits(memberId: string) {
  await assertAdmin();
  return core.getMemberVisits(memberId);
}

export async function createMember(input: core.CreateMemberInput) {
  await assertAdmin();
  return core.createMember(input);
}

export async function updateMember(
  id: string,
  patch: { name?: string; email?: string; channel?: string; contactId?: string; note?: string },
) {
  await assertAdmin();
  return core.updateMember(id, patch);
}

export async function addPackage(memberId: string, type: core.PackageType) {
  await assertAdmin();
  return core.addPackage(memberId, type);
}

export async function cancelPackage(packageId: string) {
  await assertAdmin();
  return core.cancelPackage(packageId);
}

export async function recordVisit(args: {
  memberId?: string; phone?: string; packageId?: string; via?: string;
}) {
  await assertAdmin();
  return core.recordVisit(args);
}

export async function undoVisit(visitLogId: string) {
  await assertAdmin();
  return core.undoVisit(visitLogId);
}
