"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addClosedSlot, removeClosedSlot, type ClosedSlot } from "@/app/actions/settings";
import { TIME_SLOTS } from "@/app/_components/trips-data";

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-kanit)", fontSize: 13, padding: "9px 11px",
  borderRadius: 8, border: "1.5px solid var(--border-2)",
  background: "#fff", color: "var(--fg-1)", width: "100%", outline: "none",
};

export default function ClosedSlotsSettings({ initialSlots }: { initialSlots: ClosedSlot[] }) {
  const [slots, setSlots]   = useState(initialSlots);
  const [date, setDate]     = useState("");
  const [hour, setHour]     = useState<string>("all");   // "all" = whole day
  const [label, setLabel]   = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sync when server re-renders (after router.refresh)
  useEffect(() => { setSlots(initialSlots); }, [initialSlots]);

  const handleAdd = () => {
    if (!date || isPending) return;
    const optimistic: ClosedSlot = {
      id:    `opt-${Date.now()}`,
      date,
      hour:  hour === "all" ? undefined : hour,
      label: label || undefined,
    };
    setSlots((prev) => [...prev, optimistic].sort((a, b) => a.date.localeCompare(b.date) || (a.hour ?? "").localeCompare(b.hour ?? "")));
    setDate(""); setHour("all"); setLabel("");
    startTransition(async () => {
      const result = await addClosedSlot({
        date:  optimistic.date,
        hour:  optimistic.hour,
        label: optimistic.label,
      });
      if (!result.ok) {
        setSlots((prev) => prev.filter((s) => s.id !== optimistic.id));
      } else {
        router.refresh();
      }
    });
  };

  const handleRemove = (id: string) => {
    const removed = slots.find((s) => s.id === id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
    startTransition(async () => {
      const result = await removeClosedSlot(id);
      if (!result.ok && removed) {
        setSlots((prev) =>
          [...prev, removed].sort((a, b) => a.date.localeCompare(b.date) || (a.hour ?? "").localeCompare(b.hour ?? ""))
        );
      }
    });
  };

  // Format ISO date to Thai display
  const fmtDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    const DAYS   = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
    const MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid var(--border-1)",
      padding: "18px 20px", fontFamily: "var(--font-kanit)", display: "grid", gap: 16,
    }}>
      {/* ── Add form ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)", marginBottom: 5 }}>วันที่ <span style={{ color: "var(--danger)" }}>*</span></div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)", marginBottom: 5 }}>เวลา</div>
            <select value={hour} onChange={(e) => setHour(e.target.value)} style={inputStyle}>
              <option value="all">ทั้งวัน</option>
              {TIME_SLOTS.map((h) => (
                <option key={h} value={h}>{h} น.</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)", marginBottom: 5 }}>บันทึก <span style={{ fontWeight: 300, color: "var(--fg-4)" }}>(ไม่บังคับ)</span></div>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="เช่น วันหยุดสงกรานต์"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!date || isPending}
          style={{
            padding: "10px 18px", background: "var(--sup-teal)", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
            cursor: !date || isPending ? "not-allowed" : "pointer",
            opacity: !date || isPending ? 0.6 : 1,
            fontFamily: "var(--font-kanit)", transition: "opacity 150ms",
          }}
        >
          {isPending ? "กำลังบันทึก..." : "+ เพิ่มวันปิดบริการ"}
        </button>
      </div>

      {/* ── List ─────────────────────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-3)", marginBottom: 8 }}>
          วันปิดบริการที่ตั้งไว้ ({slots.length} รายการ)
        </div>
        {slots.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--fg-4)", fontSize: 13 }}>
            ยังไม่มีวันปิดบริการ
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {slots.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 10, padding: "10px 14px",
                  background: s.hour ? "var(--sand-50)" : "#FFF7E6",
                  borderRadius: 8, border: `1px solid ${s.hour ? "var(--border-1)" : "#FFD591"}`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--fg-1)" }}>
                      {fmtDate(s.date)}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                      background: s.hour ? "var(--teal-50)" : "#FFF7E6",
                      color: s.hour ? "var(--sup-teal)" : "#D46B08",
                      border: `1px solid ${s.hour ? "var(--sup-teal)" : "#FFD591"}`,
                      whiteSpace: "nowrap",
                    }}>
                      {s.hour ? `${s.hour} น.` : "ทั้งวัน"}
                    </span>
                  </div>
                  {s.label && (
                    <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 3 }}>{s.label}</div>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(s.id)}
                  disabled={isPending}
                  style={{
                    padding: "6px 14px", background: "#FFF1F0", color: "var(--danger)",
                    border: "1px solid #FFD1CE", borderRadius: 6,
                    fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.6 : 1, flexShrink: 0,
                  }}
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
