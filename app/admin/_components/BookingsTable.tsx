"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus, type BookingRecord } from "@/app/actions/booking";
import { ROUTES_BY_ID, TIMESLOTS, formatSlot } from "@/app/_components/trips-data";

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILL_LABEL: Record<string, string> = {
  BEGINNER: "มือใหม่", INTERMEDIATE: "เคยพาย", PRO: "เชี่ยวชาญ",
};
const CHANNEL_LABEL: Record<string, string> = {
  line: "LINE", whatsapp: "WhatsApp", messenger: "Messenger",
};
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: "รอยืนยัน",  bg: "#FFF7E6", color: "#D46B08" },
  CONFIRMED: { label: "ยืนยันแล้ว", bg: "#F6FFED", color: "#389E0D" },
  CANCELLED: { label: "ยกเลิก",    bg: "#FFF1F0", color: "#CF1322" },
};

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";
const FILTERS: { id: FilterStatus; label: string }[] = [
  { id: "ALL",       label: "ทั้งหมด" },
  { id: "PENDING",   label: "รอยืนยัน" },
  { id: "CONFIRMED", label: "ยืนยันแล้ว" },
  { id: "CANCELLED", label: "ยกเลิก" },
];

// ─── Grouping ─────────────────────────────────────────────────────────────────

interface BookingGroup {
  key: string;
  date: string;
  dateKey: string;    // ISO or Thai string — used for sorting
  timeSlot: string;
  routeId: string | null;
  bookings: BookingRecord[];
}

const SLOT_ORDER: Record<string, number> = { MORNING: 0, AFTERNOON: 1 };

function buildGroups(bookings: BookingRecord[]): BookingGroup[] {
  const map = new Map<string, BookingGroup>();
  for (const b of bookings) {
    const dateKey = b.dateIso ?? b.date;
    const key     = `${dateKey}|${b.timeSlot}|${b.routeId ?? ""}`;
    if (!map.has(key)) {
      map.set(key, { key, date: b.date, dateKey, timeSlot: b.timeSlot, routeId: b.routeId, bookings: [] });
    }
    map.get(key)!.bookings.push(b);
  }
  return Array.from(map.values()).sort((a, b) => {
    const d = a.dateKey.localeCompare(b.dateKey);
    return d !== 0 ? d : (SLOT_ORDER[a.timeSlot] ?? 0) - (SLOT_ORDER[b.timeSlot] ?? 0);
  });
}

// ─── Status chip ──────────────────────────────────────────────────────────────

function Chip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ─── Action button ─────────────────────────────────────────────────────────────

function ActionButton({ label, bg, hoverBg, onClick }: { label: string; bg: string; hoverBg: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "5px 12px", background: hover ? hoverBg : bg, color: "#fff",
        border: "none", borderRadius: 7, fontFamily: "var(--font-kanit)",
        fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 150ms",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// ─── Individual booking row ────────────────────────────────────────────────────

function BookingRow({
  b,
  onStatusChange,
}: {
  b: BookingRecord;
  onStatusChange: (id: string, s: "PENDING" | "CONFIRMED" | "CANCELLED") => void;
}) {
  const meta     = STATUS_META[b.status] ?? STATUS_META.PENDING;
  const skillLbl = SKILL_LABEL[b.skillLevel ?? ""] ?? b.skillLevel ?? "—";
  const channel  = b.contactChannel ? CHANNEL_LABEL[b.contactChannel] ?? b.contactChannel : null;

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid var(--border-1)",
      padding: "12px 14px", fontFamily: "var(--font-kanit)",
    }}>
      {/* Name + status badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--fg-1)" }}>
            {b.guestName || "ไม่ระบุชื่อ"}
          </span>
          {b.guestPhone && (
            <span style={{ fontWeight: 300, fontSize: 13, color: "var(--fg-3)", marginLeft: 10 }}>
              📞 {b.guestPhone}
            </span>
          )}
          {channel && b.contactId && (
            <span style={{ fontWeight: 400, fontSize: 12, color: "var(--sup-teal)", marginLeft: 10 }}>
              {channel}: {b.contactId}
            </span>
          )}
        </div>
        <Chip label={meta.label} bg={meta.bg} color={meta.color} />
      </div>

      {/* Trip details */}
      <div style={{ fontSize: 13, color: "var(--fg-2)", fontWeight: 300, marginBottom: 4 }}>
        {b.paddlers} บอร์ด · {skillLbl}{b.weight ? ` · ${b.weight} kg` : ""}
      </div>

      {b.pickupAddress && (
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 3 }}>📍 {b.pickupAddress}</div>
      )}
      {b.notes && (
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 6 }}>💬 {b.notes}</div>
      )}

      {/* Revenue + action buttons */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--border-1)",
      }}>
        <span style={{ fontFamily: "var(--font-inter)", fontWeight: 700, color: "var(--sup-teal)", fontSize: 14 }}>
          ฿{(b.total ?? 0).toLocaleString()}
        </span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {b.status !== "CONFIRMED" && (
            <ActionButton label="✓ ยืนยัน"   bg="#389E0D"         hoverBg="#52C41A"          onClick={() => onStatusChange(b.id, "CONFIRMED")} />
          )}
          {b.status !== "PENDING" && (
            <ActionButton label="↩ รอยืนยัน" bg="var(--sup-teal)" hoverBg="#009999"          onClick={() => onStatusChange(b.id, "PENDING")} />
          )}
          {b.status !== "CANCELLED" && (
            <ActionButton label="✕ ยกเลิก"   bg="#CF1322"         hoverBg="#F5222D"          onClick={() => onStatusChange(b.id, "CANCELLED")} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({
  group,
  onStatusChange,
}: {
  group: BookingGroup;
  onStatusChange: (id: string, s: "PENDING" | "CONFIRMED" | "CANCELLED") => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const route       = ROUTES_BY_ID[group.routeId ?? ""];
  const slotInfo    = TIMESLOTS.find((t) => t.id === group.timeSlot);
  // Hourly slots ("09:00") won't match legacy TIMESLOTS — fall back gracefully
  const slotLabel   = slotInfo ? slotInfo.label : formatSlot(group.timeSlot);
  const slotTime    = slotInfo ? slotInfo.time  : `${group.timeSlot} น.`;
  const slotIcon    = slotInfo?.icon ?? "⏰";
  const totalBoards = group.bookings.reduce((s, b) => s + b.paddlers, 0);
  const pending     = group.bookings.filter((b) => b.status === "PENDING").length;
  const confirmed   = group.bookings.filter((b) => b.status === "CONFIRMED").length;
  const cancelled   = group.bookings.filter((b) => b.status === "CANCELLED").length;

  // Extract day number and short day name from Thai date string "ส. 23 พ.ค."
  const dayNum  = group.date.match(/\d+/)?.[0] ?? "—";
  const dayName = group.date.split(" ")[0] ?? "";

  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid var(--border-1)",
      boxShadow: "var(--shadow-sm)", overflow: "hidden", fontFamily: "var(--font-kanit)",
    }}>
      {/* Clickable header */}
      <div
        onClick={() => setExpanded((x) => !x)}
        style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
      >
        {/* Date chip */}
        <div style={{
          textAlign: "center", background: "var(--teal-50)", borderRadius: 10,
          padding: "8px 10px", minWidth: 52, flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, color: "var(--sup-teal)", fontWeight: 700, letterSpacing: "0.04em" }}>{dayName}</div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 22, fontWeight: 700, color: "var(--sup-teal)", lineHeight: 1.1 }}>{dayNum}</div>
        </div>

        {/* Trip info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--fg-1)", marginBottom: 3 }}>
            {slotIcon} {slotLabel}
            <span style={{ fontFamily: "var(--font-inter)", fontWeight: 400, fontSize: 12, color: "var(--fg-4)", marginLeft: 8 }}>
              {slotTime}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 7 }}>
            {route?.name ?? group.routeId ?? "ไม่ระบุเส้นทาง"}
            {route && <span style={{ fontSize: 12, color: "var(--fg-4)", marginLeft: 8 }}>{route.km} กม</span>}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {pending   > 0 && <Chip label={`รอ ${pending}`}       bg="#FFF7E6" color="#D46B08" />}
            {confirmed > 0 && <Chip label={`ยืนยัน ${confirmed}`} bg="#F6FFED" color="#389E0D" />}
            {cancelled > 0 && <Chip label={`ยกเลิก ${cancelled}`} bg="#FFF1F0" color="#CF1322" />}
          </div>
        </div>

        {/* Total boards + expand arrow */}
        <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 22, color: "var(--fg-1)", lineHeight: 1 }}>
              {totalBoards}
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-4)", fontWeight: 300, marginTop: 2 }}>บอร์ด</div>
          </div>
          <div style={{
            fontSize: 20, color: "var(--fg-4)",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 200ms",
          }}>⌄</div>
        </div>
      </div>

      {/* Expanded: individual bookers */}
      {expanded && (
        <div style={{
          background: "var(--sand-50)", borderTop: "1px solid var(--border-1)",
          padding: "12px 16px", display: "grid", gap: 8,
        }}>
          {group.bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "16px 0", color: "var(--fg-4)", fontSize: 13 }}>
              ไม่มีผู้จองในหมวดนี้
            </div>
          ) : (
            group.bookings.map((b) => (
              <BookingRow key={b.id} b={b} onStatusChange={onStatusChange} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  bookings: BookingRecord[];
}

export default function BookingsTable({ bookings: initial }: Props) {
  const [filter, setFilter]          = useState<FilterStatus>("ALL");
  const [bookings, setBookings]      = useState(initial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Filter first, then group
  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);
  const groups   = buildGroups(filtered);

  // Counts on UNFILTERED data for the tab badges
  const counts: Record<string, number> = {};
  bookings.forEach((b) => { counts[b.status] = (counts[b.status] ?? 0) + 1; });

  const handleStatusChange = (id: string, status: "PENDING" | "CONFIRMED" | "CANCELLED") => {
    // Optimistic update
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    startTransition(async () => {
      const result = await updateBookingStatus(id, status);
      if (!result.ok) router.refresh();
    });
  };

  return (
    <div style={{ padding: "16px 24px 40px" }}>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const sel   = filter === f.id;
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
              <span style={{
                fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700,
                background: sel ? "var(--sup-teal)" : "var(--border-2)",
                color: sel ? "#fff" : "var(--fg-3)",
                borderRadius: 999, padding: "1px 7px", minWidth: 20, textAlign: "center",
              }}>
                {count}
              </span>
            </button>
          );
        })}
        {isPending && (
          <span style={{ fontSize: 12, color: "var(--fg-4)", alignSelf: "center", marginLeft: 8 }}>
            กำลังอัปเดต...
          </span>
        )}
      </div>

      {/* Grouped cards */}
      {groups.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--fg-4)", fontFamily: "var(--font-kanit)", fontSize: 16 }}>
          ไม่มีการจองในหมวดนี้
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {groups.map((group) => (
            <GroupCard key={group.key} group={group} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
