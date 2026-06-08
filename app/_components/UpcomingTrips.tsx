"use client";

import { useState, useEffect } from "react";
import { ROUTES_BY_ID, type UpcomingTrip } from "./trips-data";
import SpecialTripBookingModal from "./SpecialTripBookingModal";
import { useLang } from "./lang-context";
import { T } from "./translations";

interface UpcomingTripsProps {
  trips: UpcomingTrip[];
  onJoin: (trip: UpcomingTrip) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeLabels(timeSlot: string) {
  const isLegacy = timeSlot === "MORNING" || timeSlot === "AFTERNOON";
  const display =
    timeSlot === "MORNING"   ? "รอบเช้า" :
    timeSlot === "AFTERNOON" ? "รอบบ่าย" :
    `${timeSlot} น.`;
  const range =
    timeSlot === "MORNING"   ? "07:00 – 11:00" :
    timeSlot === "AFTERNOON" ? "13:00 – 17:00" :
    timeSlot;
  return { isLegacy, display, range };
}

// ─── Trip Detail Lightbox ──────────────────────────────────────────────────────

function TripDetailModal({
  trip, onClose, onJoin,
}: {
  trip: UpcomingTrip;
  onClose: () => void;
  onJoin: () => void;
}) {
  const { lang } = useLang();
  const t = T[lang].trips;
  const route   = ROUTES_BY_ID[trip.routeId];
  const full    = trip.joined >= trip.max;
  const seatPct = (trip.joined / trip.max) * 100;
  const [copied, setCopied] = useState(false);
  const { display: timeDisplay, range: timeRange } = timeLabels(trip.timeSlot);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/?trip=${encodeURIComponent(trip.id)}#trips`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoin = () => { onClose(); onJoin(); };

  const isSpecial = !!trip.isSpecial;
  const purple = "#7B1FA2";
  const purpleSoft = "#F3E5F5";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.52)", backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        animation: "fadeIn 160ms var(--ease-out)",
      }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%", maxWidth: 460,
          maxHeight: "92vh", overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.24)",
          display: "flex", flexDirection: "column",
          animation: "slideUp 200ms var(--ease-out)",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "22px 22px 0",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isSpecial && (
              <span style={{
                display: "inline-block", marginBottom: 8,
                padding: "3px 12px", borderRadius: 999,
                background: purple, color: "#fff",
                fontFamily: "var(--font-kanit)", fontSize: 11, fontWeight: 700,
              }}>✨ Special Trip</span>
            )}
            <div style={{
              fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 26, lineHeight: 1.2,
              color: isSpecial ? "#4A148C" : "var(--fg-1)",
            }}>
              {isSpecial ? (trip.specialName ?? "Special Trip") : `${trip.day} · ${trip.date}`}
            </div>
            <div style={{
              fontFamily: "var(--font-kanit)", fontWeight: 400, fontSize: 15,
              color: isSpecial ? purple : "var(--fg-2)", marginTop: 5,
            }}>
              {isSpecial ? `${trip.date} · ${trip.day}` : ""}{isSpecial ? " · " : ""}{timeDisplay}
              {!isSpecial && ` · ${timeRange}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 999,
              border: "none", background: "var(--slate-100)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, lineHeight: 1, color: "var(--fg-3)",
            }}
          >×</button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "16px 22px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Regular trip: route block */}
          {!isSpecial && (
            <div style={{
              background: "var(--teal-50)", borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700, color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
                {t.route}
              </div>
              <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 22, color: "var(--fg-1)", marginBottom: 4 }}>
                {route?.name ?? "Custom"}
              </div>
              {route?.note && (
                <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-2)", marginBottom: 12, lineHeight: 1.6 }}>
                  {route.note}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                {([
                  { label: lang === "th" ? "ระยะทาง" : "Distance", value: `${route?.km ?? "?"}${lang === "th" ? " กม" : " km"}` },
                  { label: lang === "th" ? "ระยะเวลา" : "Duration", value: `${route?.duration ?? "?"}${lang === "th" ? " ชม" : " hrs"}` },
                  { label: lang === "th" ? "ราคา/บอร์ด" : "Price/board", value: `฿${route?.price?.toLocaleString("th-TH") ?? "?"}` },
                ] as { label: string; value: string }[]).map(({ label, value }) => (
                  <div key={label} style={{
                    flex: 1, background: "#fff", borderRadius: 10, padding: "8px 6px", textAlign: "center",
                  }}>
                    <div style={{ fontFamily: "var(--font-kanit)", fontSize: 10, color: "var(--fg-3)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 16, color: "var(--teal-700)" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special trip: description + location + price */}
          {isSpecial && (
            <div style={{
              background: purpleSoft, border: `1.5px solid #CE93D8`, borderRadius: 14, padding: "14px 16px",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              {trip.specialDescription && (
                <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 15, color: "#4A148C", lineHeight: 1.7 }}>
                  {trip.specialDescription}
                </div>
              )}
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 14, color: purple }}>📍 {trip.specialLocation}</div>
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 14, color: purple }}>🕐 {timeDisplay} · {timeRange}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                <div style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontFamily: "var(--font-kanit)", fontSize: 11, color: "#9C27B0", marginBottom: 3 }}>เช่าบอร์ด</div>
                  <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 20, color: "#6A1B9A" }}>
                    ฿{trip.specialRentalPrice?.toLocaleString("th-TH")}
                  </div>
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontFamily: "var(--font-kanit)", fontSize: 11, color: "#9C27B0", marginBottom: 3 }}>นำบอร์ดมาเอง</div>
                  <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 20, color: "#6A1B9A" }}>
                    ฿{trip.specialOwnBoardPrice?.toLocaleString("th-TH")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seats */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 15, color: "var(--fg-2)" }}>
                {isSpecial
                  ? <span style={{ color: purple }}>จัดโดยทีมงาน</span>
                  : <>{t.bookedBy} <strong style={{ color: "var(--fg-1)", fontSize: 17 }}>{trip.host}</strong></>
                }
              </div>
              <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 15, color: full ? "var(--danger)" : (isSpecial ? purple : "var(--sup-teal)") }}>
                {trip.joined}/{trip.max} {t.boards}
              </div>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: isSpecial ? "rgba(123,31,162,0.15)" : "var(--sand-200)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${seatPct}%`,
                background: full ? "var(--danger)" : (isSpecial ? purple : seatPct > 75 ? "var(--sup-orange)" : "var(--sup-teal)"),
                transition: "width 320ms var(--ease-out)",
              }} />
            </div>
            {!full && (
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-3)", marginTop: 6 }}>
                {lang === "th"
                  ? `เหลืออีก ${trip.max - trip.joined} บอร์ด`
                  : `${trip.max - trip.joined} board${trip.max - trip.joined !== 1 ? "s" : ""} remaining`}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
            {/* Share */}
            <button
              onClick={handleShare}
              style={{
                flex: "0 0 auto", padding: "12px 16px", borderRadius: 12,
                border: `1.5px solid ${copied ? (isSpecial ? purple : "var(--sup-teal)") : "var(--border-2)"}`,
                background: copied ? (isSpecial ? purpleSoft : "var(--teal-50)") : "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 14,
                color: copied ? (isSpecial ? purple : "var(--sup-teal)") : "var(--fg-2)",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 200ms",
                whiteSpace: "nowrap",
              }}
            >
              {copied
                ? (lang === "th" ? "✓ คัดลอกแล้ว!" : "✓ Copied!")
                : (lang === "th" ? "🔗 แชร์" : "🔗 Share")}
            </button>

            {/* Join */}
            <button
              disabled={full}
              onClick={handleJoin}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, border: "none",
                cursor: full ? "not-allowed" : "pointer",
                fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 15,
                background: full
                  ? "var(--slate-200)"
                  : isSpecial ? purple : "var(--sup-teal)",
                color: full ? "var(--fg-3)" : "#fff",
                boxShadow: full ? "none" : isSpecial
                  ? "0 4px 16px rgba(123,31,162,0.35)"
                  : "var(--shadow-glow-teal)",
                transition: "all 180ms",
              }}
            >
              {full
                ? t.full
                : isSpecial
                  ? `${t.join} →`
                  : `${t.join} +฿${route?.price?.toLocaleString("th-TH") ?? 0}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trip Cards ────────────────────────────────────────────────────────────────

function TripCard({
  trip, onViewDetail,
}: {
  trip: UpcomingTrip;
  onViewDetail: () => void;
}) {
  const [hover, setHover] = useState(false);
  const { lang } = useLang();
  const t = T[lang].trips;
  const route   = ROUTES_BY_ID[trip.routeId];
  const full    = trip.joined >= trip.max;
  const seatPct = (trip.joined / trip.max) * 100;
  const { display: timeDisplay, range: timeRange } = timeLabels(trip.timeSlot);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onViewDetail}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onViewDetail()}
      style={{
        background: "#fff", border: "1px solid var(--border-1)", borderRadius: 12,
        padding: 18, cursor: "pointer",
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-md)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "all 220ms var(--ease-out)",
        display: "flex", flexDirection: "column", gap: 10,
        opacity: full ? 0.72 : 1,
        outline: "none",
      }}
    >
      {/* Date + time */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 56, padding: "8px 4px", textAlign: "center",
          background: full ? "var(--slate-200)" : "var(--teal-50)",
          color: full ? "var(--fg-3)" : "var(--teal-700)",
          borderRadius: 8, fontFamily: "var(--font-kanit)", flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>{trip.day.slice(0, 3)}</div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{trip.date.match(/\d+/)?.[0]}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 15, color: "var(--fg-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{trip.date}</div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "var(--fg-2)", marginTop: 2, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 500 }}>{timeDisplay}</span> · {timeRange}
          </div>
        </div>
      </div>

      {/* Route */}
      <div style={{ padding: "8px 0", borderTop: "1px dashed var(--border-1)", borderBottom: "1px dashed var(--border-1)" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 600, color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em" }}>{t.route}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 16, color: "var(--fg-1)" }}>{route?.name ?? "Custom"}</span>
          <span style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 16, color: "var(--sup-teal)", whiteSpace: "nowrap" }}>฿{route?.price ?? "?"}</span>
        </div>
        <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{route?.note ?? ""}</div>
      </div>

      {/* Seats */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 13, color: "var(--fg-2)" }}>
            {t.bookedBy} <strong style={{ color: "var(--fg-1)" }}>{trip.host}</strong>
          </span>
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600, color: full ? "var(--danger)" : "var(--fg-2)", whiteSpace: "nowrap" }}>
            {trip.joined}/{trip.max} {t.boards}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "var(--sand-200)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${seatPct}%`, background: full ? "var(--danger)" : (seatPct > 75 ? "var(--sup-orange)" : "var(--sup-teal)"), transition: "width 320ms var(--ease-out)" }} />
        </div>
      </div>

      {/* CTA hint */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 4, padding: "8px 12px", borderRadius: 10,
        background: full ? "var(--slate-100)" : "var(--teal-50)",
        color: full ? "var(--fg-3)" : "var(--sup-teal)",
        fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 13,
        userSelect: "none",
      }}>
        <span>{full ? t.full : (lang === "th" ? "ดูรายละเอียด" : "View details")}</span>
        {!full && <span style={{ fontSize: 16 }}>→</span>}
      </div>
    </div>
  );
}

function SpecialTripCard({
  trip, onViewDetail,
}: {
  trip: UpcomingTrip;
  onViewDetail: () => void;
}) {
  const [hover, setHover] = useState(false);
  const { lang } = useLang();
  const t = T[lang].trips;
  const full    = trip.joined >= trip.max;
  const seatPct = (trip.joined / trip.max) * 100;
  const { display: timeDisplay } = timeLabels(trip.timeSlot);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onViewDetail}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onViewDetail()}
      style={{
        background: "linear-gradient(135deg, #F3E5F5, #E1BEE7)",
        border: `2px solid ${full ? "#CE93D8" : "#8E24AA"}`,
        borderRadius: 12, padding: 18, cursor: "pointer",
        boxShadow: hover ? "0 8px 32px rgba(142,36,170,0.18)" : "0 2px 12px rgba(142,36,170,0.10)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "all 220ms var(--ease-out)",
        display: "flex", flexDirection: "column", gap: 10,
        opacity: full ? 0.72 : 1,
        outline: "none",
      }}
    >
      {/* Badge + Date */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{
          padding: "3px 10px", borderRadius: 999,
          background: "#7B1FA2", color: "#fff",
          fontFamily: "var(--font-kanit)", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
        }}>✨ Special Trip</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 48, padding: "6px 4px", textAlign: "center",
            background: "rgba(123,31,162,0.12)", color: "#6A1B9A",
            borderRadius: 8, fontFamily: "var(--font-kanit)", flexShrink: 0,
          }}>
            <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>{trip.day.slice(0, 3)}</div>
            <div style={{ fontFamily: "var(--font-inter)", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{trip.date.match(/\d+/)?.[0]}</div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 14, color: "#4A148C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{trip.date}</div>
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 12, color: "#6A1B9A", marginTop: 1 }}>{timeDisplay}</div>
          </div>
        </div>
      </div>

      {/* Trip info */}
      <div style={{ padding: "8px 0", borderTop: "1px dashed rgba(142,36,170,0.25)", borderBottom: "1px dashed rgba(142,36,170,0.25)" }}>
        <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 16, color: "#4A148C", marginBottom: 4 }}>{trip.specialName}</div>
        {trip.specialDescription && (
          <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "#6A1B9A", marginBottom: 6, lineHeight: 1.5 }}>{trip.specialDescription}</div>
        )}
        <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, color: "#6A1B9A", marginBottom: 6 }}>📍 {trip.specialLocation}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: "rgba(123,31,162,0.08)", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 10, color: "#9C27B0", marginBottom: 2 }}>เช่าบอร์ด</div>
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 15, color: "#6A1B9A" }}>฿{trip.specialRentalPrice?.toLocaleString("th-TH")}</div>
          </div>
          <div style={{ flex: 1, background: "rgba(123,31,162,0.08)", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 10, color: "#9C27B0", marginBottom: 2 }}>นำบอร์ดมาเอง</div>
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 15, color: "#6A1B9A" }}>฿{trip.specialOwnBoardPrice?.toLocaleString("th-TH")}</div>
          </div>
        </div>
      </div>

      {/* Seats */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "#7B1FA2" }}>จัดโดยทีมงาน</span>
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600, color: full ? "var(--danger)" : "#7B1FA2" }}>
            {trip.joined}/{trip.max} {t.boards}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(123,31,162,0.15)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${seatPct}%`, background: full ? "var(--danger)" : "#8E24AA", transition: "width 320ms var(--ease-out)" }} />
        </div>
      </div>

      {/* CTA hint */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 4, padding: "8px 12px", borderRadius: 10,
        background: full ? "rgba(0,0,0,0.06)" : "rgba(123,31,162,0.12)",
        color: full ? "#9E9E9E" : "#7B1FA2",
        fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 13,
        userSelect: "none",
      }}>
        <span>{full ? t.full : (lang === "th" ? "ดูรายละเอียด" : "View details")}</span>
        {!full && <span style={{ fontSize: 16 }}>→</span>}
      </div>
    </div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

export default function UpcomingTrips({ trips, onJoin }: UpcomingTripsProps) {
  const [detailTrip,      setDetailTrip]      = useState<UpcomingTrip | null>(null);
  const [specialModalTrip, setSpecialModalTrip] = useState<UpcomingTrip | null>(null);
  const { lang } = useLang();
  const t = T[lang].trips;

  const handleJoin = (trip: UpcomingTrip) => {
    if (trip.isSpecial) {
      setSpecialModalTrip(trip);
    } else {
      onJoin(trip);
    }
  };

  return (
    <section id="trips" style={{ background: "var(--sand-50)" }} className="section-pad">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2 className="section-title">
              {t.title.pre}<span className="accent">{t.title.accent}</span>{t.title.post}
            </h2>
            <p className="section-sub">{t.sub}</p>
          </div>
          <a href="#book" className="btn btn-teal" style={{ padding: "11px 20px", fontSize: 14 }}>{t.newTrip} →</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {trips.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛶</div>
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 18, fontWeight: 500, color: "var(--fg-2)", marginBottom: 8 }}>
                {t.noTrips}
              </div>
              <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-3)", marginBottom: 24, lineHeight: 1.6 }}>
                {lang === "th" ? "จองก่อนเป็นคนแรก แล้วให้เพื่อนๆ กดร่วมทริปมาด้วยกัน!" : "Be the first to book, then invite friends to join your trip!"}
              </div>
              <a href="#book" className="btn btn-primary" style={{ padding: "12px 24px", fontSize: 14 }}>
                {t.newTrip} →
              </a>
            </div>
          ) : (
            trips.map((trip) => (
              trip.isSpecial
                ? <SpecialTripCard key={trip.id} trip={trip} onViewDetail={() => setDetailTrip(trip)} />
                : <TripCard        key={trip.id} trip={trip} onViewDetail={() => setDetailTrip(trip)} />
            ))
          )}
        </div>
      </div>

      {/* Trip detail lightbox */}
      {detailTrip && (
        <TripDetailModal
          trip={detailTrip}
          onClose={() => setDetailTrip(null)}
          onJoin={() => {
            setDetailTrip(null);
            handleJoin(detailTrip);
          }}
        />
      )}

      {/* Special trip booking modal (opens after joining from detail) */}
      {specialModalTrip && (
        <SpecialTripBookingModal
          trip={specialModalTrip}
          onClose={() => setSpecialModalTrip(null)}
          onBooked={() => setSpecialModalTrip(null)}
        />
      )}
    </section>
  );
}
