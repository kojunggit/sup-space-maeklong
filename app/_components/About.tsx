function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-inter)", fontSize: 44, fontWeight: 700, lineHeight: 1.0, color: "var(--sup-teal)", letterSpacing: "-0.02em" }}>{n}</div>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-2)", fontWeight: 400, marginTop: 6 }}>{label}</div>
    </div>
  );
}

export default function About({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <section id="about" style={{ background: "var(--teal-50)", position: "relative", overflow: "hidden" }} className="section-pad">
      <div style={{ position: "absolute", top: -120, right: -100, width: 360, height: 360, borderRadius: "50%", background: "var(--sup-orange)", opacity: 0.10, filter: "blur(8px)" }} />

      <div className="container" style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, alignItems: "center" }} className="about-grid">
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-xl)", aspectRatio: "4/5", background: "url('/images/photographer-sup.jpg') 72% center/cover" }} />
            <div style={{ position: "absolute", bottom: -28, left: -24, background: "#fff", padding: "14px 18px 14px 14px", borderRadius: 12, boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 12, transform: "rotate(-3deg)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--sup-orange)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter)", fontSize: 18, fontWeight: 700, color: "#fff" }}>{rating.toFixed(1)}</div>
              <div>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 600, color: "var(--fg-1)" }}>★★★★★</div>
                <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "var(--fg-3)" }}>{reviewCount.toLocaleString()} รีวิว Google</div>
              </div>
            </div>
          </div>

          <div>
            <div className="eyebrow">เกี่ยวกับเรา</div>
            <h2 className="section-title">มากกว่าการพาย SUP คือการได้เห็น<span className="accent">แม่กลองในมุมที่คนส่วนใหญ่ไม่เคยเห็น</span></h2>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 400, fontSize: 17, lineHeight: 1.7, color: "var(--fg-1)", margin: "12px 0 18px" }}>
              คลองสายเล็กที่ซ่อนตัวอยู่หลังตลาดน้ำ สวนมะพร้าวริมฝั่งน้ำ บ้านไม้เก่าแก่ที่ยังคงวิถีชีวิตดั้งเดิม
            </p>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 16, lineHeight: 1.75, color: "var(--fg-2)", margin: "0 0 16px" }}>
              SUP Space Maeklong เกิดขึ้นจากความหลงใหลในเสน่ห์ของลุ่มน้ำแม่กลอง และความตั้งใจที่อยากให้ผู้คนได้สัมผัสธรรมชาติ วัฒนธรรม และชุมชนท้องถิ่นอย่างใกล้ชิด ผ่านการเดินทางที่เรียบง่ายบน Stand Up Paddle Board
            </p>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 16, lineHeight: 1.75, color: "var(--fg-2)", margin: "0 0 16px" }}>
              เราไม่ได้พาคุณมาเพียงเพื่อพาย SUP แต่พาคุณออกไปค้นพบมุมเล็กๆ ที่นักท่องเที่ยวส่วนใหญ่อาจไม่มีโอกาสได้เห็น และเราเชื่อว่าจะทำให้คุณหลงรักสมุทรสงครามมากขึ้น
            </p>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 16, lineHeight: 1.75, color: "var(--fg-2)", margin: "0 0 28px" }}>
              ไม่ว่าคุณจะเป็นมือใหม่ นักท่องเที่ยวสายธรรมชาติ หรือคนที่กำลังมองหาช่วงเวลาสงบๆ ห่างจากความวุ่นวายของเมือง SUP Space Maeklong พร้อมดูแลให้ทุกการพายเป็นประสบการณ์ที่สนุก ปลอดภัย และน่าจดจำ
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              <Stat n="600+" label="ลูกค้าฤดูกาลนี้" />
              <Stat n="6 ปี" label="บนแม่กลอง" />
              <Stat n="100%" label="ปลอดภัยมือใหม่" />
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 880px) { .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </section>
  );
}
