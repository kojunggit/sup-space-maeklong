"use client";

import { useState, useTransition, useEffect } from "react";
import { createBooking } from "@/app/actions/booking";
import { formatSlot } from "@/app/_components/trips-data";
import type { UpcomingTrip } from "@/app/_components/trips-data";

interface Props {
  trip: UpcomingTrip;
  onClose: () => void;
  onBooked: () => void;
}

const CHANNELS = [
  { id: "line",      label: "LINE" },
  { id: "whatsapp",  label: "WhatsApp" },
  { id: "messenger", label: "Messenger" },
];

export default function SpecialTripBookingModal({ trip, onClose, onBooked }: Props) {
  const [boardChoice, setBoardChoice]   = useState<"rental" | "own">("rental");
  const [paddlers,    setPaddlers]      = useState(1);
  const [name,        setName]          = useState("");
  const [phone,       setPhone]         = useState("");
  const [channel,     setChannel]       = useState("");
  const [contactId,   setContactId]     = useState("");
  const [pickup,      setPickup]        = useState("");
  const [notes,       setNotes]         = useState("");
  const [done,        setDone]          = useState(false);
  const [error,       setError]         = useState<string | null>(null);
  const [isPending,   startTransition]  = useTransition();

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const unitPrice = boardChoice === "rental"
    ? (trip.specialRentalPrice ?? 0)
    : (trip.specialOwnBoardPrice ?? 0);
  const total = unitPrice * paddlers;

  const canSubmit = name.trim() && phone.trim();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await createBooking({
        date:          trip.date,
        dateIso:       trip.dateKey,
        timeSlot:      trip.timeSlot,
        routeId:       "",
        paddlers,
        weight:        0,
        skillLevel:    "",
        photoPermission: "allow",
        total,
        guestName:     name.trim(),
        guestPhone:    phone.trim(),
        contactChannel: channel || undefined,
        contactId:     contactId.trim() || undefined,
        pickupAddress: pickup.trim() || undefined,
        notes:         notes.trim() || undefined,
        specialTripId: trip.specialTripId,
        boardChoice,
      });
      if (res.ok) {
        setDone(true);
        onBooked();
      } else {
        setError(res.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "9px 12px",
    borderRadius: 8, border: "1.5px solid var(--border-2)",
    fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-1)",
    background: "#fafafa", outline: "none",
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480,
        maxHeight: "90dvh", overflowY: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--border-1)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                background: "#F3E5F5", color: "#7B1FA2", fontFamily: "var(--font-kanit)",
              }}>✨ Special Trip</span>
            </div>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 17, color: "var(--fg-1)" }}>
              {trip.specialName}
            </div>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "var(--fg-3)", marginTop: 3 }}>
              {trip.date} · {formatSlot(trip.timeSlot)} · 📍 {trip.specialLocation}
            </div>
            {trip.specialDescription && (
              <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "var(--fg-2)", marginTop: 6, lineHeight: 1.55 }}>
                {trip.specialDescription}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 20, cursor: "pointer",
            color: "var(--fg-3)", lineHeight: 1, flexShrink: 0, padding: 4,
          }}>✕</button>
        </div>

        {done ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 18, color: "var(--fg-1)", marginBottom: 8 }}>
              จองสำเร็จ!
            </div>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-3)", marginBottom: 24, lineHeight: 1.6 }}>
              ทีมงานจะยืนยันการจองภายใน 1 ชั่วโมง
            </div>
            <button onClick={onClose} className="btn btn-teal" style={{ padding: "10px 28px" }}>ปิด</button>
          </div>
        ) : (
          <div style={{ padding: 20, display: "grid", gap: 14 }}>

            {/* Board choice */}
            <div>
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, color: "var(--fg-3)", marginBottom: 8 }}>เลือกประเภทบอร์ด</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["rental", "own"] as const).map((choice) => {
                  const price = choice === "rental" ? trip.specialRentalPrice : trip.specialOwnBoardPrice;
                  const label = choice === "rental" ? "เช่าบอร์ด" : "นำบอร์ดมาเอง";
                  const active = boardChoice === choice;
                  return (
                    <button key={choice} onClick={() => setBoardChoice(choice)} style={{
                      padding: "10px 12px", borderRadius: 10,
                      border: `2px solid ${active ? "#8E24AA" : "var(--border-2)"}`,
                      background: active ? "#F3E5F5" : "#fafafa",
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600, color: active ? "#7B1FA2" : "var(--fg-1)" }}>{label}</div>
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: 16, fontWeight: 700, color: active ? "#7B1FA2" : "var(--fg-2)", marginTop: 2 }}>฿{price?.toLocaleString("th-TH")}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paddlers */}
            <div>
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, color: "var(--fg-3)", marginBottom: 8 }}>จำนวนบอร์ด</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setPaddlers((v) => Math.max(1, v - 1))}
                  style={{ width: 34, height: 34, borderRadius: 999, border: "1.5px solid #8E24AA", background: "#fff", color: "#8E24AA", fontSize: 20, cursor: "pointer" }}>−</button>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 26, fontWeight: 700, minWidth: 36, textAlign: "center", color: "var(--fg-1)" }}>{paddlers}</span>
                <button onClick={() => setPaddlers((v) => Math.min(trip.max - trip.joined, v + 1))}
                  style={{ width: 34, height: 34, borderRadius: 999, border: "1.5px solid #8E24AA", background: "#fff", color: "#8E24AA", fontSize: 20, cursor: "pointer" }}>+</button>
                <span style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-3)" }}>
                  รวม <strong style={{ color: "#7B1FA2" }}>฿{total.toLocaleString("th-TH")}</strong>
                </span>
              </div>
            </div>

            {/* Name + Phone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--fg-3)", marginBottom: 4 }}>ชื่อ *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ-นามสกุล" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--fg-3)", marginBottom: 4 }}>เบอร์โทร *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" type="tel" style={inputStyle} />
              </div>
            </div>

            {/* Contact channel */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--fg-3)", marginBottom: 4 }}>ช่องทางติดต่อ</label>
                <select value={channel} onChange={(e) => setChannel(e.target.value)} style={inputStyle}>
                  <option value="">— ไม่ระบุ —</option>
                  {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              {channel && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--fg-3)", marginBottom: 4 }}>ID / Username</label>
                  <input value={contactId} onChange={(e) => setContactId(e.target.value)} placeholder={`${CHANNELS.find(c=>c.id===channel)?.label} ID`} style={inputStyle} />
                </div>
              )}
            </div>

            {/* Pickup + Notes */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--fg-3)", marginBottom: 4 }}>ที่อยู่รับ-ส่ง (ถ้ามี)</label>
              <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="ที่อยู่ที่ต้องการให้รับ" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--fg-3)", marginBottom: 4 }}>หมายเหตุ</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="แพ้อาหาร / ต้องการยืมเสื้อชูชีพ ฯลฯ" style={inputStyle} />
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>⚠ {error}</div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isPending}
              className={canSubmit && !isPending ? "btn btn-primary" : "btn"}
              style={{
                width: "100%", padding: "12px", fontSize: 15, marginTop: 4,
                ...(!canSubmit || isPending ? { background: "var(--slate-200)", color: "var(--fg-3)", boxShadow: "none", cursor: "not-allowed" } : {}),
              }}
            >
              {isPending ? "กำลังจอง..." : `ยืนยันการจอง · ฿${total.toLocaleString("th-TH")}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
