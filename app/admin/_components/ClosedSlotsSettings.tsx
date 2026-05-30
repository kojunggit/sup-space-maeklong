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

const sortSlots = (arr: ClosedSlot[]) =>
  [...arr].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.startHour ?? a.hour ?? "").localeCompare(b.startHour ?? b.hour ?? ""),
  );

type Mode = "all" | "range";

export default function ClosedSlotsSettings({ initialSlots }: { initialSlots: ClosedSlot[] }) {
  const [slots, setSlots]   = useState(initialSlots);
  const [date, setDate]     = useState("");
  const [mode, setMode]     = useState<Mode>("all");        // "all" = whole day, "range" = time window
  const [startHour, setStartHour] = useState<string>(TIME_SLOTS[0]);
  const [endHour, setEndHour]     = useState<string>(TIME_SLOTS[TIME_SLOTS.length - 1]);
  const [label, setLabel]   = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sync when server re-renders (after router.refresh)
  useEffect(() => { setSlots(initialSlots); }, [initialSlots]);

  const handleAdd = () => {
    if (!date || isPending) return;
    // Normalise the range so start is never after end
    const lo = startHour <= endHour ? startHour : endHour;
    const hi = startHour <= endHour ? endHour : startHour;
    const optimistic: ClosedSlot = {
      id:    `opt-${Date.now()}`,
      date,
      startHour: mode === "range" ? lo : undefined,
      endHour:   mode === "range" ? hi : undefined,
      label: label || undefined,
    };
    setSlots((prev) => sortSlots([...prev, optimistic]));
    setDate(""); setMode("all"); setLabel("");
    setStartHour(TIME_SLOTS[0]); setEndHour(TIME_SLOTS[TIME_SLOTS.length - 1]);
    startTransition(async () => {
      const result = await addClosedSlot({
        date:      optimistic.date,
        startHour: optimistic.startHour,
        endHour:   optimistic.endHour,
        label:     optimistic.label,
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
        setSlots((prev) => sortSlots([...prev, removed]));
      }
    });
  };

  // Human-readable description of a slot's closed time
  const slotTimeLabel = (s: ClosedSlot): string => {
    if (s.startHour && s.endHour) return `${s.startHour}–${s.endHour} น.`;
    if (s.startHour) return `${s.startHour} น.`;
    if (s.hour) return `${s.hour} น.`;
    return "ทั้งวัน";
  };
  const isPartial = (s: ClosedSlot) => !!(s.hour || s.startHour);

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
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)", marginBottom: 5 }}>ปิดบริการ</div>
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} style={inputStyle}>
              <option value="all">ทั้งวัน</option>
              <option value="range">ระบุช่วงเวลา</option>
            </select>
          </div>
        </div>

        {mode === "range" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "end" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)", marginBottom: 5 }}>ตั้งแต่</div>
              <select value={startHour} onChange={(e) => setStartHour(e.target.value)} style={inputStyle}>
                {TIME_SLOTS.map((h) => (
                  <option key={h} value={h}>{h} น.</option>
                ))}
              </select>
            </div>
            <div style={{ paddingBottom: 9, color: "var(--fg-4)", fontSize: 13 }}>ถึง</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)", marginBottom: 5 }}>ถึง</div>
              <select value={endHour} onChange={(e) => setEndHour(e.target.value)} style={inputStyle}>
                {TIME_SLOTS.map((h) => (
                  <option key={h} value={h}>{h} น.</option>
                ))}
              </select>
            </div>
          </div>
        )}

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
                  background: isPartial(s) ? "var(--sand-50)" : "#FFF7E6",
                  borderRadius: 8, border: `1px solid ${isPartial(s) ? "var(--border-1)" : "#FFD591"}`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--fg-1)" }}>
                      {fmtDate(s.date)}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                      background: isPartial(s) ? "var(--teal-50)" : "#FFF7E6",
                      color: isPartial(s) ? "var(--sup-teal)" : "#D46B08",
                      border: `1px solid ${isPartial(s) ? "var(--sup-teal)" : "#FFD591"}`,
                      whiteSpace: "nowrap",
                    }}>
                      {slotTimeLabel(s)}
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
