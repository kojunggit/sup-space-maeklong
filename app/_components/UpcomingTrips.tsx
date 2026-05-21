"use client";

import { useState } from "react";
import { UPCOMING_TRIPS, ROUTES_BY_ID, type UpcomingTrip } from "./trips-data";

interface UpcomingTripsProps {
  onJoin: (trip: UpcomingTrip) => void;
}

function TripCard({ trip, onJoin }: { trip: UpcomingTrip; onJoin: () => void }) {
  const [hover, setHover] = useState(false);
  const route = ROUTES_BY_ID[trip.routeId];
  const full = trip.joined >= trip.max;
  const timeLabel = trip.timeSlot === "MORNING" ? "เช้า" : "บ่าย";
  const timeRange = trip.timeSlot === "MORNING" ? "07:00 – 11:00" : "13:00 – 17:00";
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
            <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 500 }}>รอบ{timeLabel}</span> · {timeRange}
          </div>
        </div>
      </div>

      {/* Route */}
      <div style={{ padding: "8px 0", borderTop: "1px dashed var(--border-1)", borderBottom: "1px dashed var(--border-1)" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 600, color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em" }}>เส้นทาง</div>
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
            จองโดย <strong style={{ color: "var(--fg-1)" }}>{trip.host}</strong>
          </span>
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600, color: full ? "var(--danger)" : "var(--fg-2)", whiteSpace: "nowrap" }}>
            {trip.joined}/{trip.max} บอร์ด
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
        {full ? "เต็มแล้ว" : `ร่วมทริปนี้ +฿${route?.price ?? 0}`}
      </button>
    </div>
  );
}

export default function UpcomingTrips({ onJoin }: UpcomingTripsProps) {
  return (
    <section id="trips" style={{ background: "var(--sand-50)" }} className="section-pad">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow">ทริปที่กำลังจะมา</div>
            <h2 className="section-title">
              ร่วมพายกับ<span className="accent">เพื่อนใหม่</span>
            </h2>
            <p className="section-sub">ลูกค้าจองทริปไว้แล้ว · คุณกดร่วมไปได้เลย ไม่ต้องตั้งกลุ่มเอง · สูงสุดทริปละ 8 บอร์ด</p>
          </div>
          <a href="#book" className="btn btn-teal" style={{ padding: "11px 20px", fontSize: 14 }}>หรือ จองทริปใหม่ →</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {UPCOMING_TRIPS.map((t) => (
            <TripCard key={t.id} trip={t} onJoin={() => onJoin(t)} />
          ))}
        </div>
      </div>
    </section>
  );
}
