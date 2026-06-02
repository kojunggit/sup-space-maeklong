"use client";

import { useState } from "react";
import { ROUTES_BY_ID, type UpcomingTrip } from "./trips-data";
import SpecialTripBookingModal from "./SpecialTripBookingModal";
import { useLang } from "./lang-context";
import { T } from "./translations";

interface UpcomingTripsProps {
  trips: UpcomingTrip[];
  onJoin: (trip: UpcomingTrip) => void;
}

function TripCard({ trip, onJoin }: { trip: UpcomingTrip; onJoin: () => void }) {
  const [hover, setHover] = useState(false);
  const { lang } = useLang();
  const t = T[lang].trips;
  const route = ROUTES_BY_ID[trip.routeId];
  const full = trip.joined >= trip.max;
  // Handle both legacy ("MORNING"/"AFTERNOON") and new hourly ("09:00") slots
  const isLegacy  = trip.timeSlot === "MORNING" || trip.timeSlot === "AFTERNOON";
  const timeLabel =
    trip.timeSlot === "MORNING"   ? "เช้า" :
    trip.timeSlot === "AFTERNOON" ? "บ่าย" :
    `${trip.timeSlot} น.`;
  const timeRange =
    trip.timeSlot === "MORNING"   ? "07:00 – 11:00" :
    trip.timeSlot === "AFTERNOON" ? "13:00 – 17:00" :
    trip.timeSlot;
  // Display: "รอบเช้า" for legacy, just "09:00 น." for hourly
  const timeDisplay = isLegacy ? `รอบ${timeLabel}` : timeLabel;
  const seatPct = (trip.joined / trip.max) * 100;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff", border: "1px solid var(--border-1)", borderRadius: 12,
        padding: 18,
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-md)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "all 220ms var(--ease-out)",
        display: "flex", flexDirection: "column", gap: 10,
        opacity: full ? 0.72 : 1,
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

      {/* CTA */}
      <button
        disabled={full}
        onClick={onJoin}
        className={full ? "btn" : "btn btn-primary"}
        style={{
          width: "100%", padding: "10px 16px", fontSize: 14, marginTop: 4,
          ...(full ? { background: "var(--slate-200)", color: "var(--fg-3)", boxShadow: "none", cursor: "not-allowed" } : {}),
        }}
      >
        {full ? t.full : `${t.join} +฿${route?.price ?? 0}`}
      </button>
    </div>
  );
}

function SpecialTripCard({ trip, onJoin }: { trip: UpcomingTrip; onJoin: () => void }) {
  const [hover, setHover] = useState(false);
  const { lang } = useLang();
  const t = T[lang].trips;
  const full = trip.joined >= trip.max;
  const isLegacy   = trip.timeSlot === "MORNING" || trip.timeSlot === "AFTERNOON";
  const timeLabel  = trip.timeSlot === "MORNING" ? "เช้า" : trip.timeSlot === "AFTERNOON" ? "บ่าย" : `${trip.timeSlot} น.`;
  const timeDisplay = isLegacy ? `รอบ${timeLabel}` : timeLabel;
  const seatPct = (trip.joined / trip.max) * 100;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "linear-gradient(135deg, #F3E5F5, #E1BEE7)",
        border: `2px solid ${full ? "#CE93D8" : "#8E24AA"}`,
        borderRadius: 12, padding: 18,
        boxShadow: hover ? "0 8px 32px rgba(142,36,170,0.18)" : "0 2px 12px rgba(142,36,170,0.10)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "all 220ms var(--ease-out)",
        display: "flex", flexDirection: "column", gap: 10,
        opacity: full ? 0.72 : 1,
      }}
    >
      {/* Badge + Date */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{
          padding: "3px 10px", borderRadius: 999,
          background: "#7B1FA2", color: "#fff",
          fontFamily: "var(--font-kanit)", fontSize: 11, fontWeight: 700,
          whiteSpace: "nowrap",
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

      {/* CTA */}
      <button
        disabled={full}
        onClick={onJoin}
        style={{
          width: "100%", padding: "10px 16px", fontSize: 14, marginTop: 4,
          borderRadius: 10, border: "none", fontFamily: "var(--font-kanit)", fontWeight: 600,
          cursor: full ? "not-allowed" : "pointer",
          background: full ? "rgba(0,0,0,0.08)" : "#7B1FA2",
          color: full ? "#9E9E9E" : "#fff",
          boxShadow: full ? "none" : "0 4px 16px rgba(123,31,162,0.35)",
          transition: "all 180ms",
        }}
      >
        {full ? t.full : `${t.join} →`}
      </button>
    </div>
  );
}

export default function UpcomingTrips({ trips, onJoin }: UpcomingTripsProps) {
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
            trips.map((t) => (
              t.isSpecial
                ? <SpecialTripCard key={t.id} trip={t} onJoin={() => handleJoin(t)} />
                : <TripCard        key={t.id} trip={t} onJoin={() => handleJoin(t)} />
            ))
          )}
        </div>
      </div>

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
