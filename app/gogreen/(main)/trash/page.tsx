"use client";

import { useState } from "react";
import { recordTrashWeight } from "@/app/actions/gogreen";
import { useTrashLeaderboard } from "../../useTrashLeaderboard";
import type { TrashLeaderboardEntry } from "@/app/actions/gogreen";

const MEDAL = ["🥇", "🥈", "🥉"];

function formatKg(kg: number) {
  return `${kg.toLocaleString("th-TH", { maximumFractionDigits: 2 })} กก.`;
}

function TopEntry({ entry }: { entry: TrashLeaderboardEntry }) {
  if (entry.rank === 1) {
    return (
      <div className="rounded-2xl border-2 border-[#0ca30c] bg-[#e6f6e6] p-6 text-center">
        <p className="text-5xl">🥇</p>
        <p className="mt-2 text-2xl font-bold">{entry.name}</p>
        <p className="text-sm text-[#52514e]">{entry.phone}</p>
        <p className="mt-2 text-4xl font-bold text-[#0ca30c]">{formatKg(entry.weightKg as number)}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[#e1e0d9] bg-white p-4 text-center">
      <p className="text-3xl">{MEDAL[entry.rank - 1] ?? "🎖️"}</p>
      <p className="mt-1 font-semibold">{entry.name}</p>
      <p className="text-xs text-[#898781]">{entry.phone}</p>
      <p className="mt-1 text-xl font-bold text-[#008300]">{formatKg(entry.weightKg as number)}</p>
    </div>
  );
}

function RestRow({ entry }: { entry: TrashLeaderboardEntry }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-6 shrink-0 text-center text-sm font-semibold text-[#898781]">{entry.rank}</span>
        <div className="min-w-0">
          <p className="truncate font-medium">{entry.name}</p>
          <p className="text-xs text-[#898781]">{entry.phone}</p>
        </div>
      </div>
      <span className="shrink-0 font-semibold text-[#008300]">{formatKg(entry.weightKg as number)}</span>
    </li>
  );
}

export default function GoGreenTrashPage() {
  const { data, loading, error: loadError, refresh } = useTrashLeaderboard();
  const [phone, setPhone] = useState("");
  const [weight, setWeight] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; weightKg: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    const weightNum = parseFloat(weight);
    if (Number.isNaN(weightNum)) {
      setFormError("กรุณากรอกน้ำหนักขยะเป็นตัวเลข (กก.)");
      return;
    }
    setSubmitting(true);
    const result = await recordTrashWeight(phone, weightNum);
    setSubmitting(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSuccess({ name: result.name, weightKg: result.weightKg });
    setPhone("");
    setWeight("");
    refresh();
  }

  const top1 = data?.top10[0];
  const top2to3 = data?.top10.slice(1, 3) ?? [];
  const rest = data?.top10.slice(3) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">บันทึกน้ำหนักขยะ</h1>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-[#e1e0d9] bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-[#52514e]">
            เบอร์โทรศัพท์
            <input
              type="tel"
              inputMode="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812345678"
              className="mt-1 w-full rounded-xl border border-[#e1e0d9] px-4 py-3 focus:border-[#008300] focus:outline-none"
            />
          </label>
          <label className="block text-sm text-[#52514e]">
            น้ำหนักขยะ (กก.)
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="mt-1 w-full rounded-xl border border-[#e1e0d9] px-4 py-3 focus:border-[#008300] focus:outline-none"
            />
          </label>
        </div>
        {formError && <p className="text-sm text-[#d03b3b]">{formError}</p>}
        {success && (
          <p className="text-sm text-[#0ca30c]">
            บันทึกแล้ว: {success.name} — {formatKg(success.weightKg)}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#008300] py-3 font-medium text-white disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {submitting ? "กำลังบันทึก…" : "บันทึก"}
        </button>
      </form>

      {loading && !data && <p className="text-sm text-[#898781]">กำลังโหลดข้อมูล…</p>}
      {loadError && <p className="text-sm text-[#d03b3b]">{loadError}</p>}

      {data && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-medium text-[#52514e]">
              10 อันดับผู้เก็บขยะได้มากที่สุด ({data.weighedCount} / {data.totalPaddlers} คนชั่งแล้ว)
            </h2>

            {data.top10.length === 0 ? (
              <p className="rounded-2xl border border-[#e1e0d9] bg-white p-4 text-center text-sm text-[#898781]">
                ยังไม่มีข้อมูลน้ำหนักขยะ
              </p>
            ) : (
              <div className="space-y-3">
                {top1 && <TopEntry entry={top1} />}
                {top2to3.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {top2to3.map((entry) => (
                      <TopEntry key={entry.phone} entry={entry} />
                    ))}
                  </div>
                )}
                {rest.length > 0 && (
                  <ul className="divide-y divide-[#e1e0d9] overflow-hidden rounded-2xl border border-[#e1e0d9] bg-white">
                    {rest.map((entry) => (
                      <RestRow key={entry.phone} entry={entry} />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full rounded-xl border border-[#e1e0d9] bg-white py-2.5 text-sm font-medium text-[#52514e] hover:bg-[#f0efec]"
            >
              {showAll ? "ซ่อนรายชื่อผู้ร่วมพายทั้งหมด" : "แสดงข้อมูลผู้ร่วมพายทั้งหมดและน้ำหนักขยะ"}
            </button>

            {showAll && (
              <ul className="mt-3 divide-y divide-[#e1e0d9] overflow-hidden rounded-2xl border border-[#e1e0d9] bg-white">
                {data.all.map((entry) => (
                  <li key={entry.phone} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{entry.name}</p>
                      <p className="text-xs text-[#898781]">{entry.phone}</p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        entry.weightKg != null ? "text-[#008300]" : "text-[#898781]"
                      }`}
                    >
                      {entry.weightKg != null ? formatKg(entry.weightKg) : "ยังไม่ชั่ง"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-center text-xs text-[#898781]">
            อัปเดตล่าสุด {new Date(data.fetchedAt).toLocaleTimeString("th-TH")} · ข้อมูลรีเฟรชอัตโนมัติทุก 20 วินาที
          </p>
        </>
      )}
    </div>
  );
}
