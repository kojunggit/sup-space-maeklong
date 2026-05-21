"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus, type BookingRecord } from "@/app/actions/booking";
import { ROUTES_BY_ID, TIMESLOTS } from "@/app/_components/trips-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SKILL_LABEL: Record<string, string> = {
  BEGINNER: "มือใหม่", INTERMEDIATE: "เคยพาย", PRO: "เชี่ยวชาญ",
};
const PHOTO_LABEL: Record<string, string> = {
  allow: "อนุญาต ✓", notAllow: "ไม่อนุญาต", private: "Private 🔒",
};
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: "รอยืนยัน",  bg: "#FFF7E6", color: "#D46B08" },
  CONFIRMED: { label: "ยืนยันแล้ว", bg: "#F6FFED", color: "#389E0D" },
  CANCELLED: { label: "ยกเลิก",    bg: "#FFF1F0", color: "#CF1322" },
};

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";

function timeSlotLabel(id: string) {
  const s = TIMESLOTS.find((t) => t.id === id);
  return s ? `${s.label} · ${s.time}` : id;
}
function routeName(id: string | null) {
  if (!id) return "—";
  return ROUTES_BY_ID[id]?.name ?? id;
}
function shortId(id: string) {
  return id.slice(-6).toUpperCase();
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
}

// ─── Single booking card ──────────────────────────────────────────────────────

function BookingCard({ b, onStatusChange }: { b: BookingRecord; onStatusChange: (id: string, s: "PENDING" | "CONFIRMED" | "CANCELLED") => void }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[b.status] ?? STATUS_META.PENDING;

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-1)", boxShadow: "var(--shadow-sm)", overflow: "hidden", fontFamily: "var(--font-kanit)" }}>
      {/* Main row */}
      <div
        onClick={() => setExpanded((x) => !x)}
        style={{ padding: "16px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}
      >
        <div style={{ minWidth: 0 }}>
          {/* Row 1: ref + status */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 12, color: "var(--fg-4)", letterSpacing: "0.08em" }}>#{shortId(b.id)}</span>
            <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color }}>{meta.label}</span>
            <span style={{ fontSize: 11, color: "var(--fg-4)", fontWeight: 300 }}>{fmtDate(b.createdAt)}</span>
          </div>
          {/* Row 2: customer */}
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-1)", marginBottom: 2 }}>
            {b.guestName || "ไม่ระบุชื่อ"}
            {b.guestPhone && <span style={{ fontWeight: 300, fontSize: 13, color: "var(--fg-3)", marginLeft: 10 }}>{b.guestPhone}</span>}
          </div>
          {/* Row 3: trip summary */}
          <div style={{ fontSize: 13, color: "var(--fg-2)", fontWeight: 300, lineHeight: 1.5 }}>
            {b.date} · {timeSlotLabel(b.timeSlot)} · {routeName(b.routeId)} · {b.paddlers} บอร์ด
          </div>
        </div>

        {/* Right: total + expand arrow */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 20, color: "var(--sup-teal)", whiteSpace: "nowrap" }}>
            ฿{(b.total ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: 18, color: "var(--fg-4)", marginTop: 4, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>⌄</div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: "0 18px 16px", display: "grid", gap: 10 }}>
          <div style={{ height: 1, background: "var(--border-1)" }} />

          {/* Detail grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
            <Detail label="ระดับฝีมือ" value={SKILL_LABEL[b.skillLevel ?? ""] ?? b.skillLevel ?? "—"} />
            <Detail label="น้ำหนัก" value={b.weight ? `${b.weight} kg` : "ไม่ระบุ"} />
            <Detail label="ถ่ายภาพ" value={PHOTO_LABEL[b.photoPermission] ?? b.photoPermission} />
            <Detail label="จองเมื่อ" value={fmtDate(b.createdAt)} />
          </div>

          {b.pickupAddress && (
            <div style={{ padding: "10px 12px", background: "var(--sand-50)", borderRadius: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 500, color: "var(--fg-2)" }}>ที่อยู่รับ-ส่ง: </span>
              <span style={{ color: "var(--fg-1)", fontWeight: 300 }}>{b.pickupAddress}</span>
            </div>
          )}
          {b.notes && (
            <div style={{ padding: "10px 12px", background: "var(--teal-50)", borderRadius: 8, fontSize: 13 }}>
              <span style={{ fontWeight: 500, color: "var(--teal-700)" }}>หมายเหตุ: </span>
              <span style={{ color: "var(--teal-700)", fontWeight: 300 }}>{b.notes}</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {b.status !== "CONFIRMED" && (
              <ActionButton
                label="✓ ยืนยัน"
                bg="#389E0D" hoverBg="#52C41A"
                onClick={() => onStatusChange(b.id, "CONFIRMED")}
              />
            )}
            {b.status !== "PENDING" && (
              <ActionButton
                label="↩ รอยืนยัน"
                bg="var(--sup-teal)" hoverBg="#009999"
                onClick={() => onStatusChange(b.id, "PENDING")}
              />
            )}
            {b.status !== "CANCELLED" && (
              <ActionButton
                label="✕ ยกเลิก"
                bg="#CF1322" hoverBg="#F5222D"
                onClick={() => onStatusChange(b.id, "CANCELLED")}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--fg-4)", marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--fg-1)", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function ActionButton({ label, bg, hoverBg, onClick }: { label: string; bg: string; hoverBg: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ padding: "8px 16px", background: hover ? hoverBg : bg, color: "#fff", border: "none", borderRadius: 8, fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 150ms" }}
    >
      {label}
    </button>
  );
}

// ─── Main table component ─────────────────────────────────────────────────────

interface Props {
  bookings: BookingRecord[];
}

const FILTERS: { id: FilterStatus; label: string }[] = [
  { id: "ALL",       label: "ทั้งหมด" },
  { id: "PENDING",   label: "รอยืนยัน" },
  { id: "CONFIRMED", label: "ยืนยันแล้ว" },
  { id: "CANCELLED", label: "ยกเลิก" },
];

export default function BookingsTable({ bookings: initial }: Props) {
  const [filter, setFilter]       = useState<FilterStatus>("ALL");
  const [bookings, setBookings]   = useState(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const displayed = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const counts: Record<string, number> = {};
  bookings.forEach((b) => { counts[b.status] = (counts[b.status] ?? 0) + 1; });

  const handleStatusChange = (id: string, status: "PENDING" | "CONFIRMED" | "CANCELLED") => {
    // Optimistic update
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));

    startTransition(async () => {
      const result = await updateBookingStatus(id, status);
      if (!result.ok) {
        // Revert optimistic update by refreshing
        router.refresh();
      }
    });
  };

  return (
    <div style={{ padding: "16px 24px 40px" }}>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const sel = filter === f.id;
          const count = f.id === "ALL" ? bookings.length : (counts[f.id] ?? 0);
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "8px 16px", borderRadius: 999, border: "1.5px solid",
                borderColor: sel ? "var(--sup-teal)" : "var(--border-2)",
                background: sel ? "var(--teal-50)" : "#fff",
                color: sel ? "var(--sup-teal)" : "var(--fg-2)",
                fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: sel ? 700 : 500,
                cursor: "pointer", transition: "all 160ms",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {f.label}
              <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, background: sel ? "var(--sup-teal)" : "var(--border-2)", color: sel ? "#fff" : "var(--fg-3)", borderRadius: 999, padding: "1px 7px", minWidth: 20, textAlign: "center" }}>
                {count}
              </span>
            </button>
          );
        })}
        {isPending && <span style={{ fontSize: 12, color: "var(--fg-4)", alignSelf: "center", marginLeft: 8 }}>กำลังอัปเดต...</span>}
      </div>

      {/* Booking cards */}
      {displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--fg-4)", fontFamily: "var(--font-kanit)", fontSize: 16 }}>
          ไม่มีการจองในหมวดนี้
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {displayed.map((b) => (
            <BookingCard key={b.id} b={b} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
