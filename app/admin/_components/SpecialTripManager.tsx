"use client";

import { useState, useTransition } from "react";
import { createSpecialTrip, cancelSpecialTrip } from "@/app/actions/special-trips";
import { TIME_SLOTS, formatSlot } from "@/app/_components/trips-data";
import type { SpecialTripRecord } from "@/app/actions/special-trips";

interface Props {
  initialTrips: SpecialTripRecord[];
}

const EMPTY = {
  name: "", description: "", rentalPrice: "", ownBoardPrice: "",
  dateIso: "", timeSlot: "09:00", location: "", maxBoards: "8",
};

export default function SpecialTripManager({ initialTrips }: Props) {
  const [trips, setTrips]           = useState(initialTrips);
  const [form, setForm]             = useState(EMPTY);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (k: keyof typeof EMPTY, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canSubmit =
    form.name.trim() && form.dateIso && form.timeSlot &&
    form.location.trim() && Number(form.rentalPrice) > 0 &&
    Number(form.ownBoardPrice) > 0;

  const handleCreate = () => {
    setSaved(false); setError(null);
    startTransition(async () => {
      const res = await createSpecialTrip({
        name:          form.name.trim(),
        description:   form.description.trim() || undefined,
        rentalPrice:   Number(form.rentalPrice),
        ownBoardPrice: Number(form.ownBoardPrice),
        dateIso:       form.dateIso,
        timeSlot:      form.timeSlot,
        location:      form.location.trim(),
        maxBoards:     Math.max(1, Number(form.maxBoards) || 8),
      });
      if (res.ok) {
        setSaved(true);
        setForm(EMPTY);
        setTimeout(() => setSaved(false), 3000);
        // Optimistic: add placeholder, router will refresh
        const d = new Date(form.dateIso + "T00:00:00");
        const THAI_S = ["อา","จ.","อ.","พ.","พฤ","ศ.","ส."];
        const THAI_M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
        const newTrip: SpecialTripRecord = {
          id:            res.id!,
          name:          form.name.trim(),
          description:   form.description.trim() || null,
          rentalPrice:   Number(form.rentalPrice),
          ownBoardPrice: Number(form.ownBoardPrice),
          dateIso:       form.dateIso,
          date:          `${THAI_S[d.getDay()]} ${d.getDate()} ${THAI_M[d.getMonth()]}`,
          timeSlot:      form.timeSlot,
          location:      form.location.trim(),
          maxBoards:     Math.max(1, Number(form.maxBoards) || 8),
          status:        "ACTIVE",
          createdAt:     new Date().toISOString(),
        };
        setTrips((prev) => [newTrip, ...prev]);
      } else {
        setError("ไม่สามารถสร้างทริปได้ กรุณาลองใหม่");
      }
    });
  };

  const handleCancel = (id: string) => {
    setTrips((prev) => prev.map((t) => t.id === id ? { ...t, status: "CANCELLED" } : t));
    startTransition(async () => {
      const res = await cancelSpecialTrip(id);
      if (!res.ok) {
        setTrips((prev) => prev.map((t) => t.id === id ? { ...t, status: "ACTIVE" } : t));
      }
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "8px 12px",
    borderRadius: 8, border: "1.5px solid var(--border-2)",
    fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-1)",
    background: "#fafafa", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 500,
    color: "var(--fg-3)", fontFamily: "var(--font-kanit)", marginBottom: 4,
  };

  const activeTrips    = trips.filter((t) => t.status === "ACTIVE");
  const cancelledTrips = trips.filter((t) => t.status === "CANCELLED");

  return (
    <div style={{ display: "grid", gap: 16 }}>

      {/* ─── Create form ─── */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: 20,
        boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>✨</span>
          <div>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600, color: "var(--fg-1)" }}>สร้างทริปพิเศษ</div>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>ทริปนี้จะแสดงบนเว็บให้ลูกค้าเลือกจอง</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>ชื่อทริป *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="เช่น ทริปพิเศษ Sunset พายชมพระอาทิตย์ตก" style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>รายละเอียดทริป</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="บอกรายละเอียด เส้นทาง กิจกรรมที่น่าสนใจ..." rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </div>

          {/* Prices */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>ราคาเช่าบอร์ด / คน (฿) *</label>
              <input type="number" min={0} value={form.rentalPrice}
                onChange={(e) => set("rentalPrice", e.target.value)}
                placeholder="700" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ราคานำบอร์ดมาเอง / คน (฿) *</label>
              <input type="number" min={0} value={form.ownBoardPrice}
                onChange={(e) => set("ownBoardPrice", e.target.value)}
                placeholder="300" style={inputStyle} />
            </div>
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>วันที่ *</label>
              <input type="date" value={form.dateIso} onChange={(e) => set("dateIso", e.target.value)}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>เวลาเริ่ม *</label>
              <select value={form.timeSlot} onChange={(e) => set("timeSlot", e.target.value)} style={inputStyle}>
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>{formatSlot(s)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Capacity */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>สถานที่นัดหมาย *</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)}
                placeholder="เช่น ท่าน้ำหน้าร้าน SUP Space" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ความจุ (บอร์ด)</label>
              <input type="number" min={1} max={50} value={form.maxBoards}
                onChange={(e) => set("maxBoards", e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
          {saved  && <span style={{ fontSize: 13, color: "#389E0D", fontWeight: 600 }}>✓ สร้างทริปเรียบร้อย</span>}
          {error  && <span style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{error}</span>}
          <button
            onClick={handleCreate}
            disabled={!canSubmit || isPending}
            style={{
              marginLeft: "auto", padding: "9px 24px", borderRadius: 8, border: "none",
              background: canSubmit && !isPending ? "var(--sup-teal)" : "var(--border-2)",
              color: canSubmit && !isPending ? "#fff" : "var(--fg-4)",
              fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
              cursor: canSubmit && !isPending ? "pointer" : "not-allowed",
              transition: "all 160ms",
            }}
          >
            {isPending ? "กำลังสร้าง..." : "✨ สร้างทริปพิเศษ"}
          </button>
        </div>
      </div>

      {/* ─── Active trips list ─── */}
      {activeTrips.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700, color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
            ทริปที่กำลังจะมา ({activeTrips.length})
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {activeTrips.map((t) => (
              <TripRow key={t.id} trip={t} onCancel={() => handleCancel(t.id)} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Cancelled trips list ─── */}
      {cancelledTrips.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700, color: "var(--fg-4)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
            ยกเลิกแล้ว ({cancelledTrips.length})
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {cancelledTrips.map((t) => (
              <TripRow key={t.id} trip={t} cancelled />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TripRow({ trip, onCancel, cancelled }: { trip: SpecialTripRecord; onCancel?: () => void; cancelled?: boolean }) {
  return (
    <div style={{
      background: cancelled ? "var(--sand-50)" : "#fff",
      border: `1px solid ${cancelled ? "var(--border-2)" : "var(--border-1)"}`,
      borderRadius: 10, padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      opacity: cancelled ? 0.6 : 1,
    }}>
      {/* Purple badge */}
      <div style={{
        padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
        background: "#F3E5F5", color: "#7B1FA2", fontFamily: "var(--font-kanit)",
        whiteSpace: "nowrap",
      }}>✨ Special</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 14, color: "var(--fg-1)" }}>{trip.name}</div>
        <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
          {trip.date} · {formatSlot(trip.timeSlot)} · 📍 {trip.location}
        </div>
      </div>

      {/* Prices */}
      <div style={{ textAlign: "right", fontFamily: "var(--font-inter)", fontSize: 12 }}>
        <div style={{ color: "var(--sup-teal)", fontWeight: 700 }}>฿{trip.rentalPrice} / ฿{trip.ownBoardPrice}</div>
        <div style={{ color: "var(--fg-4)", fontSize: 10 }}>เช่า / นำมาเอง</div>
      </div>

      {/* Cancel button */}
      {!cancelled && onCancel && (
        <button
          onClick={onCancel}
          style={{
            padding: "5px 14px", borderRadius: 6, border: "1px solid var(--danger)",
            background: "#fff", color: "var(--danger)",
            fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 600,
            cursor: "pointer",
          }}
        >ยกเลิก</button>
      )}
    </div>
  );
}
