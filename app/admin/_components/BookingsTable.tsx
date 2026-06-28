"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
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
const PHOTO_LABEL: Record<string, string> = {
  allow: "อนุญาตโพสต์ได้", notAllow: "ไม่อนุญาต", private: "ส่วนตัวเท่านั้น",
};
const BOARD_LABEL: Record<string, string> = {
  rental: "เช่าบอร์ด", own: "บอร์ดตัวเอง",
};
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:   { label: "รอยืนยัน",  bg: "#FFF7E6", color: "#D46B08" },
  CONFIRMED: { label: "ยืนยันแล้ว", bg: "#F6FFED", color: "#389E0D" },
  CANCELLED: { label: "ยกเลิก",    bg: "#FFF1F0", color: "#CF1322" },
};

type FilterStatus = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED" | "PAST";
const FILTERS: { id: FilterStatus; label: string; past?: boolean }[] = [
  { id: "ALL",       label: "ทั้งหมด" },
  { id: "PENDING",   label: "รอยืนยัน" },
  { id: "CONFIRMED", label: "ยืนยันแล้ว" },
  { id: "CANCELLED", label: "ยกเลิก" },
  { id: "PAST",      label: "🏁 ทริปที่จบไปแล้ว", past: true },
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

// ─── Booking detail modal ─────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13, padding: "5px 0", borderBottom: "1px solid var(--border-1)" }}>
      <span style={{ color: "var(--fg-4)", fontWeight: 400, minWidth: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--fg-1)", fontWeight: 500, wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

function BookingDetailModal({
  booking,
  onClose,
  onStatusChange,
}: {
  booking: BookingRecord;
  onClose: () => void;
  onStatusChange: (id: string, s: "PENDING" | "CONFIRMED" | "CANCELLED") => void;
}) {
  const meta      = STATUS_META[booking.status] ?? STATUS_META.PENDING;
  const route     = ROUTES_BY_ID[booking.routeId ?? ""];
  const slotInfo  = TIMESLOTS.find((t) => t.id === booking.timeSlot);
  const slotLabel = slotInfo ? slotInfo.label : formatSlot(booking.timeSlot);
  const slotTime  = slotInfo ? slotInfo.time  : `${booking.timeSlot} น.`;

  const createdAt = new Date(booking.createdAt);
  const createdStr = createdAt.toLocaleString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, width: "100%", maxWidth: 480,
          maxHeight: "90vh", overflowY: "auto", fontFamily: "var(--font-kanit)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 20px 14px", borderBottom: "1px solid var(--border-1)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
          position: "sticky", top: 0, background: "#fff", borderRadius: "18px 18px 0 0",
          zIndex: 1,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "var(--fg-1)" }}>
              {booking.guestName || "ไม่ระบุชื่อ"}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-4)", marginTop: 2 }}>
              รหัส: {booking.id.slice(-8).toUpperCase()}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Chip label={meta.label} bg={meta.bg} color={meta.color} />
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 20, color: "var(--fg-4)", padding: "0 4px", lineHeight: 1,
              }}
            >✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px" }}>

          {/* Section: ข้อมูลติดต่อ */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sup-teal)", letterSpacing: "0.08em", marginBottom: 6, marginTop: 4 }}>
            ข้อมูลติดต่อ
          </div>
          <DetailRow label="ชื่อ" value={booking.guestName} />
          <DetailRow label="เบอร์โทร" value={booking.guestPhone} />
          <DetailRow label="อีเมล" value={booking.guestEmail} />
          {booking.contactChannel && (
            <DetailRow
              label="ช่องทางติดต่อ"
              value={`${CHANNEL_LABEL[booking.contactChannel] ?? booking.contactChannel}${booking.contactId ? ` — ${booking.contactId}` : ""}`}
            />
          )}

          {/* Section: รายละเอียดทริป */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sup-teal)", letterSpacing: "0.08em", marginBottom: 6, marginTop: 14 }}>
            รายละเอียดทริป
          </div>
          <DetailRow label="วันที่" value={booking.date} />
          <DetailRow label="เวลา" value={`${slotLabel} (${slotTime})`} />
          <DetailRow label="เส้นทาง" value={route ? `${route.name}${route.km ? ` — ${route.km} กม.` : ""}` : (booking.routeId ?? null)} />
          <DetailRow label="จำนวนบอร์ด" value={`${booking.paddlers} บอร์ด`} />
          <DetailRow label="ระดับทักษะ" value={SKILL_LABEL[booking.skillLevel ?? ""] ?? booking.skillLevel} />
          <DetailRow label="น้ำหนักรวม" value={booking.weight ? `${booking.weight} kg` : null} />
          {booking.boardChoice && (
            <DetailRow label="บอร์ด" value={BOARD_LABEL[booking.boardChoice] ?? booking.boardChoice} />
          )}

          {/* Section: ข้อมูลเพิ่มเติม */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sup-teal)", letterSpacing: "0.08em", marginBottom: 6, marginTop: 14 }}>
            ข้อมูลเพิ่มเติม
          </div>
          <DetailRow label="การถ่ายภาพ" value={PHOTO_LABEL[booking.photoPermission] ?? booking.photoPermission} />
          <DetailRow label="จุดรับ" value={booking.pickupAddress} />
          <DetailRow label="หมายเหตุ" value={booking.notes} />

          {/* Section: การชำระเงิน */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sup-teal)", letterSpacing: "0.08em", marginBottom: 6, marginTop: 14 }}>
            การชำระเงิน
          </div>
          <DetailRow
            label="ยอดรวม"
            value={
              <span style={{ color: "var(--sup-teal)", fontWeight: 700, fontFamily: "var(--font-inter)" }}>
                ฿{(booking.total ?? 0).toLocaleString()}
              </span>
            }
          />
          <DetailRow label="จองเมื่อ" value={createdStr} />
        </div>

        {/* Footer: action buttons */}
        <div style={{
          padding: "14px 20px 20px", borderTop: "1px solid var(--border-1)",
          display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end",
          position: "sticky", bottom: 0, background: "#fff",
          borderRadius: "0 0 18px 18px",
        }}>
          {booking.status !== "CONFIRMED" && (
            <ActionButton label="✓ ยืนยัน"   bg="#389E0D" hoverBg="#52C41A" onClick={() => { onStatusChange(booking.id, "CONFIRMED"); onClose(); }} />
          )}
          {booking.status !== "PENDING" && (
            <ActionButton label="↩ รอยืนยัน" bg="var(--sup-teal)" hoverBg="#009999" onClick={() => { onStatusChange(booking.id, "PENDING"); onClose(); }} />
          )}
          {booking.status !== "CANCELLED" && (
            <ActionButton label="✕ ยกเลิก"   bg="#CF1322" hoverBg="#F5222D" onClick={() => { onStatusChange(booking.id, "CANCELLED"); onClose(); }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Individual booking row ────────────────────────────────────────────────────

function BookingRow({
  b,
  onStatusChange,
  onSelect,
}: {
  b: BookingRecord;
  onStatusChange: (id: string, s: "PENDING" | "CONFIRMED" | "CANCELLED") => void;
  onSelect: (b: BookingRecord) => void;
}) {
  const meta     = STATUS_META[b.status] ?? STATUS_META.PENDING;
  const skillLbl = SKILL_LABEL[b.skillLevel ?? ""] ?? b.skillLevel ?? "—";
  const channel  = b.contactChannel ? CHANNEL_LABEL[b.contactChannel] ?? b.contactChannel : null;

  return (
    <div style={{
      background: "#fff", borderRadius: 10, border: "1px solid var(--border-1)",
      padding: "12px 14px", fontFamily: "var(--font-kanit)",
    }}>
      {/* Name + status badge — clickable to open detail */}
      <div
        onClick={() => onSelect(b)}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6, cursor: "pointer" }}
      >
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Chip label={meta.label} bg={meta.bg} color={meta.color} />
          <span style={{ fontSize: 12, color: "var(--fg-4)" }}>›</span>
        </div>
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
  onSelect,
}: {
  group: BookingGroup;
  onStatusChange: (id: string, s: "PENDING" | "CONFIRMED" | "CANCELLED") => void;
  onSelect: (b: BookingRecord) => void;
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
              <BookingRow key={b.id} b={b} onStatusChange={onStatusChange} onSelect={onSelect} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  upcomingBookings: BookingRecord[];
  pastBookings:     BookingRecord[];
}

export default function BookingsTable({ upcomingBookings: initialUpcoming, pastBookings: initialPast }: Props) {
  const [filter, setFilter]              = useState<FilterStatus>("ALL");
  const [upcomingBookings, setUpcoming]  = useState(initialUpcoming);
  const [selectedBooking, setSelected]   = useState<BookingRecord | null>(null);
  const [isPending, startTransition]     = useTransition();
  const router = useRouter();

  const handleSelect   = useCallback((b: BookingRecord) => setSelected(b), []);
  const handleDeselect = useCallback(() => setSelected(null), []);

  const isPast = filter === "PAST";

  // Upcoming: filter by status then group
  const upcomingFiltered = filter === "ALL" || isPast
    ? upcomingBookings
    : upcomingBookings.filter((b) => b.status === filter);
  const groups = isPast ? buildGroups(initialPast) : buildGroups(upcomingFiltered);

  // Counts on upcoming (unfiltered) for status tabs; past count for PAST tab
  const counts: Record<string, number> = {};
  upcomingBookings.forEach((b) => { counts[b.status] = (counts[b.status] ?? 0) + 1; });

  const handleStatusChange = (id: string, status: "PENDING" | "CONFIRMED" | "CANCELLED") => {
    setUpcoming((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    // Keep selectedBooking in sync if open
    setSelected((prev) => prev?.id === id ? { ...prev, status } : prev);
    startTransition(async () => {
      const result = await updateBookingStatus(id, status);
      if (!result.ok) router.refresh();
    });
  };

  return (
    <div style={{ padding: "16px 24px 40px" }}>
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={handleDeselect}
          onStatusChange={handleStatusChange}
        />
      )}
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {FILTERS.map((f, i) => {
          const sel   = filter === f.id;
          const count = f.id === "PAST"
            ? initialPast.length
            : f.id === "ALL" ? upcomingBookings.length : (counts[f.id] ?? 0);
          const accentColor = f.past ? "var(--fg-3)" : "var(--sup-teal)";
          const accentBg    = f.past ? "var(--sand-100, #F0EFE7)" : "var(--teal-50)";
          return (
            <React.Fragment key={f.id}>
              {/* Divider before PAST tab */}
              {f.past && (
                <div style={{ width: 1, height: 24, background: "var(--border-2)", margin: "0 4px" }} />
              )}
              <button
                onClick={() => setFilter(f.id)}
                style={{
                  padding: "8px 16px", borderRadius: 999, border: "1.5px solid",
                  borderColor: sel ? accentColor : "var(--border-2)",
                  background: sel ? accentBg : "#fff",
                  color: sel ? (f.past ? "var(--fg-2)" : "var(--sup-teal)") : "var(--fg-2)",
                  fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: sel ? 700 : 500,
                  cursor: "pointer", transition: "all 160ms",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {f.label}
                <span style={{
                  fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700,
                  background: sel ? accentColor : "var(--border-2)",
                  color: sel ? "#fff" : "var(--fg-3)",
                  borderRadius: 999, padding: "1px 7px", minWidth: 20, textAlign: "center",
                }}>
                  {count}
                </span>
              </button>
            </React.Fragment>
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
          {isPast ? "ยังไม่มีทริปที่ผ่านไปแล้ว" : "ไม่มีการจองในหมวดนี้"}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, opacity: isPast ? 0.75 : 1 }}>
          {groups.map((group) => (
            <GroupCard key={group.key} group={group} onStatusChange={handleStatusChange} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
