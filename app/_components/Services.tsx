"use client";

import { useState } from "react";

const SERVICES = [
  { eyebrow: "ทัวร์ไกด์", title: "13 เส้นทางพาย", desc: "สั้น กลาง ไกล · กาแฟริมคลอง · ตลาดน้ำในตำนาน · 3 ตลาดน้ำ 25 กม · ทีมเรารู้น้ำขึ้นน้ำลง และจุดถ่ายภาพดีที่สุด", bullets: ["ระยะใกล้ ฿500/บอร์ด · 2 ชม", "ระยะกลาง ฿700–750", "ระยะไกล ฿900 · 16–25 กม"], accent: "var(--sup-teal)", img: "/images/KOSI4747.jpg" },
  { eyebrow: "มือใหม่ ฟรี!", title: "สอนพายเบื้องต้น", desc: "ครั้งแรกเลย? เราสอนพื้นฐานให้ก่อนลงน้ำเสมอ · ทรงตัว · พาย · เลี้ยว · ฟรีไม่มีค่าใช้จ่ายเพิ่ม", bullets: ["บรีฟความปลอดภัย", "ฝึกบนฝั่งก่อนลงน้ำ", "เสื้อชูชีพทุกคน"], accent: "var(--sup-orange)", img: "/images/KOSI6260.jpg" },
  { eyebrow: "เก็บความทรงจำ", title: "ทีมถ่ายภาพ", desc: "เราถ่ายให้ฟรีสำหรับลง Social media · ถ้าอยากเก็บส่วนตัว มีบริการ private +฿500/คน", bullets: ["ฟรี: ภาพประชาสัมพันธ์", "ส่งทาง LINE", "Private +฿500/คน (ขั้นต่ำ 2 คน)"], accent: "var(--orange-600)", img: "/images/KOSI6162.jpg", badge: "ยอดนิยม" },
  { eyebrow: "สะดวกถึงประตู", title: "รับ-ส่งถึงที่พัก", desc: "ในรัศมี 5 กิโลเมตรจาก SUP Space Maeklong เรารับ-ส่งฟรี · เกินกว่านั้นคิดกิโลเมตรละ 7 บาท", bullets: ["ใน 5 กม · ฟรี", "เกิน 5 กม · 7฿/กม", "ไม่ต้องห่วงเรื่องที่จอด"], accent: "var(--sup-dark)", img: "/images/KOSI4714.jpg" },
] as const;

function PackageBadge({ title, price, hint, highlight }: { title: string; price: string; hint: string; highlight?: boolean }) {
  return (
    <div style={{ padding: "12px 16px", borderRadius: 10, background: highlight ? "var(--sup-orange)" : "rgba(255,255,255,0.08)", border: highlight ? "none" : "1px solid rgba(255,255,255,0.18)", minWidth: 180 }}>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 500, color: highlight ? "#fff" : "rgba(255,255,255,0.95)" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: highlight ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)" }}>฿</span>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{price}</span>
      </div>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 11, color: highlight ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)", marginTop: 2, fontWeight: 300 }}>{hint}</div>
    </div>
  );
}

interface ServiceCardProps {
  eyebrow: string; title: string; desc: string;
  bullets: readonly string[]; accent: string; img: string; badge?: string;
}

function ServiceCard({ eyebrow, title, desc, bullets, accent, img, badge }: ServiceCardProps) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff", borderRadius: 12, border: "1px solid var(--border-1)", overflow: "hidden",
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-md)",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "all 240ms var(--ease-out)",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{ height: 4, background: accent }} />
      <div style={{ height: 160, background: `url(${img}) center/cover`, position: "relative" }}>
        {badge && (
          <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(6px)", color: "var(--sup-dark)", padding: "4px 10px", borderRadius: 999, fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>★ {badge}</span>
        )}
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: accent, whiteSpace: "nowrap" }}>{eyebrow}</div>
        <h3 style={{ margin: "6px 0 8px", fontFamily: "var(--font-kanit)", fontSize: 22, fontWeight: 700, color: "var(--fg-1)", lineHeight: 1.25 }}>{title}</h3>
        <p style={{ margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-2)", lineHeight: 1.6, flex: 1 }}>{desc}</p>
        <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
          {bullets.map((b) => (
            <li key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-2)", fontWeight: 400 }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: "var(--success-soft)", color: "var(--success)", fontSize: 9, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" style={{ background: "var(--bg-page)" }} className="section-pad">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 44, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow">บริการของเรา</div>
            <h2 className="section-title">มากกว่าให้<span className="accent">เช่าบอร์ด</span></h2>
            <p className="section-sub">สี่อย่างที่เราทำได้ดี · ทัวร์ไกด์พร้อม 13 เส้นทาง · สอนพายฟรี · ถ่ายภาพ · รับ-ส่งถึงที่พัก</p>
          </div>
          <a href="#book" className="btn btn-secondary">ดูราคาทั้งหมด</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
          {SERVICES.map((s) => <ServiceCard key={s.title} {...s} />)}
        </div>

        <div style={{ marginTop: 32, padding: "24px 28px", background: "var(--sup-dark)", color: "#fff", borderRadius: 12, display: "flex", gap: 32, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--sup-orange)" }}>SUP HEALTHY · แพคเกจรายเดือน</div>
            <h3 style={{ margin: "6px 0 4px", fontFamily: "var(--font-kanit)", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>พายบ่อยๆ จ่ายน้อยลง</h3>
            <p style={{ margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>สำหรับคนที่รักการพายเป็นประจำ · ไม่สามารถยกสิทธิ์ให้ผู้อื่นได้</p>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <PackageBadge title="พาย 10 ครั้ง" price="2,900" hint="ครั้งละไม่เกิน 3 ชม" />
            <PackageBadge title="รายเดือน · ไม่จำกัด" price="3,500" hint="พายได้ไม่จำกัดจำนวน" highlight />
          </div>
        </div>
      </div>
    </section>
  );
}
