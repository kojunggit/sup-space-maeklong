import BookingWidget from "./BookingWidget";
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
  return (
    <section style={{ padding: 0, marginTop: -120, position: "relative", zIndex: 2 }}>
      <div className="container">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 560px", gap: 48, alignItems: "center" }}
          className="booking-grid"
        >
          <div style={{ padding: "60px 0" }} className="booking-pitch">
            <div className="eyebrow">วิธีที่เร็วที่สุด</div>
            <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.015em", margin: "12px 0 22px", color: "var(--fg-1)" }}>
              เลือกวัน<br />
              <span style={{ color: "var(--sup-teal)" }}>ที่เหลือ</span> เราจัดการให้
            </h2>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "var(--fg-2)", maxWidth: 440 }}>
              ยกเลิกฟรี · จ่ายหน้างาน · ทีมเรายืนยันใน LINE ภายใน 1 ชั่วโมง พร้อมแผนที่และของที่ต้องเตรียม
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 12 }}>
              <Reassurance text="ไม่ต้องใช้บัตรเครดิตในการจอง" />
              <Reassurance text="ยืนยันโดยทีมงานจริง (ไม่ใช่บอท)" />
              <Reassurance text="ยกเลิกฟรี 24 ชม. ก่อนวันทัวร์" />
              <Reassurance text="รับประกัน rain check ทุกกรณี" />
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
