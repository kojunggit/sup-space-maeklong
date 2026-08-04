"use client";

import { useState } from "react";
import { checkInByPhone, submitWalkIn } from "@/app/actions/gogreen";
import {
  BOAT_CATEGORY_LABEL,
  WALKIN_BOAT_OPTIONS,
  GROUP_TYPE_LABEL,
  type BoatCategory,
  type GroupType,
} from "../lib/sheet";

const OPENCHAT_URL =
  "https://line.me/ti/g2/KOITXum0pfntBqILnu3Sb6KCX9dd_V0riJwwiA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default";

interface SuccessInfo {
  name: string;
  groupLabel: string;
  boatLabel: string;
  boatNumber: number | null;
  alreadyCheckedIn: boolean;
  isPaddler: boolean;
}

type ViewState =
  | { step: "form" }
  | { step: "success"; info: SuccessInfo }
  | { step: "walkin"; phone: string };

export default function GoGreenRegisterPage() {
  const [phone, setPhone] = useState("");
  const [view, setView] = useState<ViewState>({ step: "form" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await checkInByPhone(phone);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.matched) {
      setView({
        step: "success",
        info: {
          name: result.name,
          groupLabel: GROUP_TYPE_LABEL.paddle,
          boatLabel: result.boatLabel,
          boatNumber: result.boatNumber,
          alreadyCheckedIn: result.alreadyCheckedIn,
          isPaddler: true,
        },
      });
    } else {
      setView({ step: "walkin", phone });
    }
  }

  function reset() {
    setPhone("");
    setView({ step: "form" });
    setError(null);
  }

  return (
    <main className="mx-auto max-w-sm space-y-6 px-4 py-8">
      <h1 className="text-center text-xl font-medium">🌱 ลงทะเบียนเข้าร่วมกิจกรรม GoGreen</h1>

      {view.step === "form" && (
        <form onSubmit={handlePhoneSubmit} className="space-y-3">
          <label className="block text-sm text-[#52514e]">
            เบอร์โทรศัพท์
            <input
              type="tel"
              inputMode="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812345678"
              className="mt-1 w-full rounded-xl border border-[#e1e0d9] px-4 py-3 text-lg focus:border-[#008300] focus:outline-none"
            />
          </label>
          {error && <p className="text-sm text-[#d03b3b]">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#008300] py-3 font-medium text-white disabled:opacity-50"
          >
            {submitting ? "กำลังตรวจสอบ…" : "ลงทะเบียน"}
          </button>
          <a
            href={OPENCHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-[#06C755] py-3 text-center font-medium text-white"
          >
            เข้าร่วม OpenChat
          </a>
          <p className="text-center text-xs text-[#898781]">
            เข้าร่วม LINE OpenChat เพื่อรับข่าวสารและแจ้งปัญหาในงาน
          </p>
        </form>
      )}

      {view.step === "success" && (
        <div className="space-y-3 rounded-2xl border border-[#e1e0d9] bg-white p-5 text-center">
          <p className="text-3xl">✅</p>
          <p className="text-lg font-medium">{view.info.name}</p>
          <p className="text-sm text-[#52514e]">
            {view.info.alreadyCheckedIn ? "เช็คอินไปแล้วก่อนหน้านี้" : "เช็คอินสำเร็จ"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-[#f0efec] px-4 py-1.5 text-sm">{view.info.groupLabel}</span>
            {view.info.isPaddler && (
              <span className="rounded-full bg-[#f0efec] px-4 py-1.5 text-sm">{view.info.boatLabel}</span>
            )}
            {view.info.boatNumber != null && (
              <span className="rounded-full bg-[#e6f6e6] px-4 py-1.5 text-sm font-medium text-[#0ca30c]">
                เรือหมายเลข {view.info.boatNumber}
              </span>
            )}
          </div>
          <button
            onClick={reset}
            className="mt-2 block w-full rounded-xl border border-[#e1e0d9] py-2.5 text-sm text-[#52514e] hover:bg-[#f0efec]"
          >
            ลงทะเบียนคนถัดไป
          </button>
        </div>
      )}

      {view.step === "walkin" && (
        <WalkInForm
          phone={view.phone}
          onDone={(info) => setView({ step: "success", info })}
          onCancel={reset}
        />
      )}
    </main>
  );
}

function WalkInForm({
  phone,
  onDone,
  onCancel,
}: {
  phone: string;
  onDone: (info: SuccessInfo) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [groupType, setGroupType] = useState<GroupType | "">("");
  const [boatCategory, setBoatCategory] = useState<BoatCategory>("own");
  const [organization, setOrganization] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isPaddler = groupType === "paddle";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!groupType) {
      setError("กรุณาเลือกประเภทผู้ลงทะเบียน");
      return;
    }
    setSubmitting(true);
    const result = await submitWalkIn({
      phone,
      name,
      groupType,
      boatCategory,
      organization,
      note,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone({
      name: result.name,
      groupLabel: result.groupLabel,
      boatLabel: result.boatLabel,
      boatNumber: result.boatNumber,
      alreadyCheckedIn: result.alreadyCheckedIn,
      isPaddler: groupType === "paddle",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#e1e0d9] bg-white p-5">
      <p className="text-sm text-[#52514e]">
        ไม่พบเบอร์นี้ในรายชื่อที่ลงทะเบียนไว้ล่วงหน้า — กรอกข้อมูลเพื่อลงทะเบียนหน้างาน
      </p>

      <label className="block text-sm text-[#52514e]">
        ชื่อ-นามสกุล
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#e1e0d9] px-4 py-3 focus:border-[#008300] focus:outline-none"
        />
      </label>

      <fieldset>
        <legend className="text-sm text-[#52514e]">ประเภทผู้ลงทะเบียน</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(["event", "paddle"] as GroupType[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupType(g)}
              className={`rounded-xl border py-2.5 text-sm transition-colors ${
                groupType === g
                  ? "border-[#008300] bg-[#e6f6e6] font-medium text-[#008300]"
                  : "border-[#e1e0d9] text-[#52514e] hover:bg-[#f0efec]"
              }`}
            >
              {GROUP_TYPE_LABEL[g]}
            </button>
          ))}
        </div>
      </fieldset>

      {isPaddler && (
        <label className="block text-sm text-[#52514e]">
          ประเภทเรือ
          <select
            value={boatCategory}
            onChange={(e) => setBoatCategory(e.target.value as BoatCategory)}
            className="mt-1 w-full rounded-xl border border-[#e1e0d9] px-4 py-3 focus:border-[#008300] focus:outline-none"
          >
            {WALKIN_BOAT_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {BOAT_CATEGORY_LABEL[cat]}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block text-sm text-[#52514e]">
        หน่วยงาน (ถ้ามี)
        <input
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#e1e0d9] px-4 py-3 focus:border-[#008300] focus:outline-none"
        />
      </label>

      <label className="block text-sm text-[#52514e]">
        หมายเหตุ (ถ้ามี)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-[#e1e0d9] px-4 py-3 focus:border-[#008300] focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-[#d03b3b]">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-[#e1e0d9] py-2.5 text-sm text-[#52514e] hover:bg-[#f0efec]"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-[#008300] py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "กำลังบันทึก…" : "ยืนยันลงทะเบียน"}
        </button>
      </div>
    </form>
  );
}
