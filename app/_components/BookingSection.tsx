"use client";

import BookingWidget from "./BookingWidget";
import { useLang } from "./lang-context";
import { T } from "./translations";
import type { UpcomingTrip } from "./trips-data";

interface BookingSectionProps {
  joinTrip?: UpcomingTrip | null;
  onClearJoin?: () => void;
}

function Reassurance({ text }: { text: string }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-kanit)", fontSize: 15, color: "var(--fg-1)", fontWeight: 400 }}>
      <span style={{ width: 24, height: 24, borderRadius: 999, background: "var(--sup-orange)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
      {text}
    </li>
  );
}

export default function BookingSection({ joinTrip, onClearJoin }: BookingSectionProps) {
  const { lang } = useLang();
  const t = T[lang].booking;

  return (
    <section style={{ padding: 0, marginTop: -120, position: "relative", zIndex: 2 }}>
      <div className="container">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 560px", gap: 48, alignItems: "center" }}
          className="booking-grid"
        >
          <div style={{ padding: "60px 0" }} className="booking-pitch">
            <div className="eyebrow">{t.eyebrow}</div>
            <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.015em", margin: "12px 0 22px", color: "var(--fg-1)" }}>
              {t.titleLine1}<br />
              <span style={{ color: "var(--sup-teal)" }}>{t.titleAccent}</span>{t.titleLine2}
            </h2>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "var(--fg-2)", maxWidth: 440 }}>
              {t.pitch}
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 12 }}>
              <Reassurance text={t.r1} />
              <Reassurance text={t.r2} />
              <Reassurance text={t.r3} />
              <Reassurance text={t.r4} />
            </ul>
          </div>

          <div>
            <BookingWidget joinTrip={joinTrip} onClearJoin={onClearJoin} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .booking-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .booking-pitch { padding: 40px 0 0 !important; }
        }
      `}</style>
    </section>
  );
}
