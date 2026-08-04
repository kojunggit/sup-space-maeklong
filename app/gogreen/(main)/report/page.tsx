"use client";

import { useMemo } from "react";
import { useGoGreenData } from "../../useGoGreenData";
import type { GoGreenRegistrant } from "@/app/actions/gogreen";
import type { BoatCategory } from "../../lib/sheet";

const NUMBERED_CATEGORIES: BoatCategory[] = ["kayak1", "kayak2"];

function summarizeBoatNumbers(registrants: GoGreenRegistrant[]) {
  return NUMBERED_CATEGORIES.map((category) => {
    const numbers = registrants
      .filter((r) => r.boatCategory === category && r.boatNumber != null)
      .map((r) => r.boatNumber as number);
    const label = registrants.find((r) => r.boatCategory === category)?.boatLabel ?? category;
    return {
      category,
      label,
      count: numbers.length,
      min: numbers.length ? Math.min(...numbers) : null,
      max: numbers.length ? Math.max(...numbers) : null,
    };
  }).filter((s) => s.count > 0);
}

function summarizeOrganizations(registrants: GoGreenRegistrant[]) {
  const tally = new Map<string, number>();
  for (const r of registrants) {
    if (!r.organization) continue;
    tally.set(r.organization, (tally.get(r.organization) ?? 0) + 1);
  }
  return [...tally.entries()]
    .map(([organization, count]) => ({ organization, count }))
    .sort((a, b) => b.count - a.count);
}

export default function GoGreenReportPage() {
  const { data, loading, error } = useGoGreenData();

  const boatNumberSummary = useMemo(
    () => (data ? summarizeBoatNumbers(data.registrants) : []),
    [data],
  );
  const orgSummary = useMemo(
    () => (data ? summarizeOrganizations(data.registrants) : []),
    [data],
  );
  const sortedRegistrants = useMemo(() => {
    if (!data) return [];
    return [...data.registrants].sort((a, b) => a.name.localeCompare(b.name, "th"));
  }, [data]);

  const generatedAt = new Date();

  return (
    <div className="space-y-6 print:space-y-4 print:text-black">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-medium">รายงานสรุปกิจกรรม</h1>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-[#008300] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#006b00]"
        >
          🖨️ พิมพ์รายงาน
        </button>
      </div>

      {loading && !data && <p className="text-sm text-[#898781] print:hidden">กำลังโหลดข้อมูล…</p>}
      {error && <p className="text-sm text-[#d03b3b] print:hidden">{error}</p>}

      {data && (
        <div className="space-y-6 print:space-y-4">
          <div className="hidden print:block print:text-center">
            <h1 className="text-2xl font-bold">🌱 รายงานสรุปกิจกรรม GoGreen</h1>
            <p className="mt-1 text-sm text-[#52514e]">
              ข้อมูล ณ วันที่{" "}
              {generatedAt.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}{" "}
              เวลา {generatedAt.toLocaleTimeString("th-TH")}
            </p>
          </div>

          <section className="print:break-inside-avoid">
            <h2 className="mb-2 text-sm font-medium text-[#52514e] print:text-black">ภาพรวมผู้ลงทะเบียน</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4 print:gap-2">
              {[
                { label: "ลงทะเบียนทั้งหมด", value: data.totalRegistered },
                { label: "เช็คอินแล้ว", value: data.checkedInCount },
                { label: "ยังไม่เช็คอิน", value: data.remainingCount },
                { label: "ลงทะเบียนหน้างาน", value: data.walkInCount },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-[#e1e0d9] bg-white p-4 text-center print:rounded-none print:border-black print:p-2"
                >
                  <p className="text-xs text-[#898781] print:text-black">{s.label}</p>
                  <p className="mt-1 text-2xl font-semibold print:text-xl">{s.value.toLocaleString("th-TH")}</p>
                </div>
              ))}
            </div>
          </section>

          {data.groupBreakdown.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2 className="mb-2 text-sm font-medium text-[#52514e] print:text-black">
                แยกตามประเภทผู้ลงทะเบียน (เช็คอินแล้ว)
              </h2>
              <table className="w-full overflow-hidden rounded-2xl border border-[#e1e0d9] bg-white text-sm print:rounded-none print:border-black">
                <tbody>
                  {data.groupBreakdown.map((g) => (
                    <tr key={g.groupType} className="border-b border-[#e1e0d9] last:border-0 print:border-black">
                      <td className="px-4 py-2">{g.label}</td>
                      <td className="px-4 py-2 text-right font-semibold">{g.count} คน</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="print:break-inside-avoid">
            <h2 className="mb-2 text-sm font-medium text-[#52514e] print:text-black">แยกตามประเภทเรือ (คาดว่าจะมา / เช็คอินแล้ว)</h2>
            <table className="w-full overflow-hidden rounded-2xl border border-[#e1e0d9] bg-white text-sm print:rounded-none print:border-black">
              <thead>
                <tr className="border-b border-[#e1e0d9] bg-[#f9f9f7] text-left print:border-black print:bg-white">
                  <th className="px-4 py-2 font-medium">ประเภทเรือ</th>
                  <th className="px-4 py-2 text-right font-medium">คาดว่าจะมา</th>
                  <th className="px-4 py-2 text-right font-medium">เช็คอินแล้ว</th>
                </tr>
              </thead>
              <tbody>
                {data.boatBreakdown.map((b) => {
                  const checked = data.boatCheckedInBreakdown.find((c) => c.category === b.category)?.count ?? 0;
                  return (
                    <tr key={b.category} className="border-b border-[#e1e0d9] last:border-0 print:border-black">
                      <td className="px-4 py-2">{b.label}</td>
                      <td className="px-4 py-2 text-right">{b.count}</td>
                      <td className="px-4 py-2 text-right font-semibold">{checked}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {boatNumberSummary.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2 className="mb-2 text-sm font-medium text-[#52514e] print:text-black">การจ่ายหมายเลขเรือคายัค</h2>
              <table className="w-full overflow-hidden rounded-2xl border border-[#e1e0d9] bg-white text-sm print:rounded-none print:border-black">
                <tbody>
                  {boatNumberSummary.map((s) => (
                    <tr key={s.category} className="border-b border-[#e1e0d9] last:border-0 print:border-black">
                      <td className="px-4 py-2">{s.label}</td>
                      <td className="px-4 py-2 text-right">
                        หมายเลข {s.min}–{s.max} ({s.count} ลำ)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {orgSummary.length > 0 && (
            <section className="print:break-inside-avoid">
              <h2 className="mb-2 text-sm font-medium text-[#52514e] print:text-black">หน่วยงานที่เข้าร่วม (จากผู้ลงทะเบียนหน้างาน)</h2>
              <table className="w-full overflow-hidden rounded-2xl border border-[#e1e0d9] bg-white text-sm print:rounded-none print:border-black">
                <tbody>
                  {orgSummary.map((o) => (
                    <tr key={o.organization} className="border-b border-[#e1e0d9] last:border-0 print:border-black">
                      <td className="px-4 py-2">{o.organization}</td>
                      <td className="px-4 py-2 text-right font-semibold">{o.count} คน</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-sm font-medium text-[#52514e] print:text-black">
              รายชื่อผู้ลงทะเบียนทั้งหมด ({sortedRegistrants.length} คน)
            </h2>
            <table className="w-full overflow-hidden rounded-2xl border border-[#e1e0d9] bg-white text-sm print:rounded-none print:border-black">
              <thead>
                <tr className="border-b border-[#e1e0d9] bg-[#f9f9f7] text-left print:border-black print:bg-white">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">ชื่อ</th>
                  <th className="px-3 py-2 font-medium">เบอร์โทร</th>
                  <th className="px-3 py-2 font-medium">ประเภท</th>
                  <th className="px-3 py-2 font-medium">เรือ</th>
                  <th className="px-3 py-2 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {sortedRegistrants.map((r, i) => (
                  <tr key={r.phone} className="border-b border-[#e1e0d9] last:border-0 print:border-black">
                    <td className="px-3 py-1.5 text-[#898781] print:text-black">{i + 1}</td>
                    <td className="px-3 py-1.5">{r.name}</td>
                    <td className="px-3 py-1.5">{r.phone}</td>
                    <td className="px-3 py-1.5">{r.groupLabel}</td>
                    <td className="px-3 py-1.5">
                      {r.boatCategory !== "none"
                        ? `${r.boatLabel}${r.boatNumber != null ? ` (#${r.boatNumber})` : ""}`
                        : "-"}
                    </td>
                    <td className="px-3 py-1.5">{r.checkedIn ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}
