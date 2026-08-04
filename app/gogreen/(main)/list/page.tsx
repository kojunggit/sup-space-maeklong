"use client";

import { useMemo, useState } from "react";
import { useGoGreenData } from "../../useGoGreenData";

type Filter = "all" | "checked" | "pending";

export default function GoGreenListPage() {
  const { data, loading, error } = useGoGreenData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const qDigits = query.replace(/\D/g, "");
    return data.registrants.filter((r) => {
      if (filter === "checked" && !r.checkedIn) return false;
      if (filter === "pending" && r.checkedIn) return false;
      if (q) {
        const nameMatch = r.name.toLowerCase().includes(q);
        const phoneMatch = qDigits && r.phone.replace(/\D/g, "").includes(qDigits);
        if (!nameMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [data, query, filter]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium">รายชื่อผู้ลงทะเบียน</h1>

      {loading && !data && <p className="text-sm text-[#898781]">กำลังโหลดข้อมูล…</p>}
      {error && <p className="text-sm text-[#d03b3b]">{error}</p>}

      {data && (
        <>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-[#f0efec] px-3 py-1">
              ทั้งหมด <b>{data.totalRegistered}</b>
            </span>
            <span className="rounded-full bg-[#e6f6e6] px-3 py-1 text-[#0ca30c]">
              เช็คอินแล้ว <b>{data.checkedInCount}</b>
            </span>
            <span className="rounded-full bg-[#fdf1dc] px-3 py-1 text-[#c98500]">
              ยังไม่เช็คอิน <b>{data.remainingCount}</b>
            </span>
          </div>

          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อหรือเบอร์โทร"
              className="flex-1 rounded-xl border border-[#e1e0d9] px-4 py-2 text-sm focus:border-[#008300] focus:outline-none"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="rounded-xl border border-[#e1e0d9] px-3 py-2 text-sm"
            >
              <option value="all">ทั้งหมด</option>
              <option value="checked">เช็คอินแล้ว</option>
              <option value="pending">ยังไม่เช็คอิน</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e1e0d9] bg-white">
            {rows.length === 0 ? (
              <p className="p-4 text-center text-sm text-[#898781]">ไม่พบรายชื่อที่ตรงกับการค้นหา</p>
            ) : (
              <ul className="divide-y divide-[#e1e0d9]">
                {rows.map((r) => (
                  <li key={r.phone} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {r.name}
                        {r.groupType === "event" && (
                          <span className="ml-2 rounded-full bg-[#f0efec] px-2 py-0.5 text-xs text-[#52514e]">
                            {r.groupLabel}
                          </span>
                        )}
                        {r.isWalkIn && (
                          <span className="ml-2 rounded-full bg-[#f0efec] px-2 py-0.5 text-xs text-[#52514e]">
                            หน้างาน
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-[#898781]">
                        {r.phone}
                        {r.boatCategory !== "none" && (
                          <>
                            {" · "}
                            {r.boatLabel}
                            {r.boatNumber != null && ` (เรือหมายเลข ${r.boatNumber})`}
                          </>
                        )}
                        {r.organization && ` · ${r.organization}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        r.checkedIn ? "bg-[#e6f6e6] text-[#0ca30c]" : "bg-[#f0efec] text-[#898781]"
                      }`}
                    >
                      {r.checkedIn ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
