"use client";

import { useGoGreenData } from "../useGoGreenData";
import type { BoatCategory } from "../lib/sheet";

const CATEGORY_DOT: Record<BoatCategory, string> = {
  own: "#2a78d6",
  kayak1: "#1baf7a",
  kayak2: "#eda100",
  sup: "#008300",
  none: "#898781",
  other: "#4a3aa7",
};

function StatTile({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[#e1e0d9] bg-white p-4">
      <p className="text-sm text-[#898781]">{label}</p>
      <p className="mt-1 text-3xl font-semibold" style={{ color: accent ?? "#0b0b0b" }}>
        {value.toLocaleString("th-TH")}
      </p>
    </div>
  );
}

export default function GoGreenDashboardPage() {
  const { data, loading, error, refresh } = useGoGreenData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">สรุปภาพรวมผู้ลงทะเบียน</h1>
        <button
          onClick={refresh}
          className="rounded-full border border-[#e1e0d9] px-3 py-1 text-xs text-[#52514e] hover:bg-[#f0efec]"
        >
          รีเฟรช
        </button>
      </div>

      {loading && !data && <p className="text-sm text-[#898781]">กำลังโหลดข้อมูล…</p>}
      {error && <p className="text-sm text-[#d03b3b]">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="ลงทะเบียนทั้งหมด" value={data.totalRegistered} />
            <StatTile label="เช็คอินแล้ว" value={data.checkedInCount} accent="#0ca30c" />
            <StatTile label="ยังไม่เช็คอิน" value={data.remainingCount} accent="#eda100" />
            <StatTile label="ลงทะเบียนหน้างาน" value={data.walkInCount} />
          </div>

          <div className="rounded-2xl border border-[#e1e0d9] bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-[#52514e]">แยกตามประเภทเรือ (เช็คอินแล้ว / ทั้งหมด)</h2>
            <div className="space-y-3">
              {data.boatBreakdown.map((b) => {
                const checked =
                  data.boatCheckedInBreakdown.find((c) => c.category === b.category)?.count ?? 0;
                const pct = b.count > 0 ? Math.round((checked / b.count) * 100) : 0;
                return (
                  <div key={b.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_DOT[b.category] }}
                        />
                        {b.label}
                      </span>
                      <span className="text-[#52514e]">
                        {checked} / {b.count}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f0efec]">
                      <div
                        className="h-full rounded-full bg-[#0ca30c] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {data.groupBreakdown.length > 0 && (
            <div className="rounded-2xl border border-[#e1e0d9] bg-white p-4">
              <h2 className="mb-3 text-sm font-medium text-[#52514e]">ผู้เช็คอินแล้ว แยกตามประเภทผู้ลงทะเบียน</h2>
              <div className="flex flex-wrap gap-2">
                {data.groupBreakdown.map((g) => (
                  <span key={g.groupType} className="rounded-full bg-[#f0efec] px-3 py-1.5 text-sm">
                    {g.label} <b>{g.count}</b>
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-[#898781]">
            อัปเดตล่าสุด {new Date(data.fetchedAt).toLocaleTimeString("th-TH")} · ข้อมูลรีเฟรชอัตโนมัติทุก 20 วินาที
          </p>
        </>
      )}
    </div>
  );
}
