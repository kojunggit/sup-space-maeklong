interface HeroProps {
  onBookClick: () => void;
}

function TrustItem({ label }: { label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: 18, height: 18, borderRadius: 999,
        background: "rgba(255,255,255,0.22)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "var(--sup-orange)", fontSize: 11, fontWeight: 700,
      }}>✓</span>
      {label}
    </span>
  );
}

export default function Hero({ onBookClick }: HeroProps) {
  return (
    <section
      id="home"
      style={{
        position: "relative", padding: 0,
        minHeight: 760,
        display: "flex", alignItems: "flex-end",
        overflow: "hidden",
        background: "var(--sup-dark)",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: "url('/images/KOSI2067.jpg') center 35%/cover",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg,rgba(0,80,80,0.40) 0%,rgba(0,80,80,0.10) 28%,rgba(26,32,44,0.05) 50%,rgba(26,32,44,0.82) 100%)",
      }} />

      <div className="container" style={{ position: "relative", padding: "0 24px 96px", width: "100%" }}>
        <div style={{ maxWidth: 740 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "6px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.16)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            color: "#fff",
            fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase",
            border: "1px solid rgba(255,255,255,0.28)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--sup-orange)" }} />
            แม่กลอง · สมุทรสงคราม
          </div>

          <h1 style={{
            margin: "22px 0 14px", color: "#fff",
            fontFamily: "var(--font-kanit)", fontWeight: 700,
            fontSize: 82, lineHeight: 1.0, letterSpacing: "-0.02em",
            textShadow: "0 2px 30px rgba(0,0,0,0.35)",
          }}>
            <span style={{ display: "block", fontWeight: 300, color: "var(--sup-sand)", fontSize: 38, marginBottom: 6 }}>
              พายซับชมแม่น้ำ
            </span>
            <span style={{ display: "block" }}>
              ลื่นไหล{" "}
              <span style={{ color: "var(--sup-orange)", whiteSpace: "nowrap" }}>ใจสงบ</span>
              {" "}ไปกับเรา
            </span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.94)", fontSize: 19, fontWeight: 300,
            lineHeight: 1.6, maxWidth: 580,
            margin: "20px 0 32px",
            textShadow: "0 1px 12px rgba(0,0,0,0.45)",
          }}>
            ทัวร์พายซับบอร์ดสำหรับมือใหม่และนักเดินทาง สองชั่วโมงบนแม่กลอง น้ำนิ่ง แสงทอง พร้อมทีมถ่ายภาพ
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={onBookClick} className="btn btn-primary" style={{ padding: "15px 28px", fontSize: 16 }}>
              จองทริปเลย →
            </button>
            <a
              href="#services"
              className="btn"
              style={{
                background: "rgba(255,255,255,0.16)", color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.45)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                fontWeight: 400,
              }}
            >
              ดูบริการของเรา
            </a>
          </div>

          <div style={{
            marginTop: 52, display: "flex", gap: 28,
            color: "rgba(255,255,255,0.92)",
            fontFamily: "var(--font-kanit)", fontSize: 14, fontWeight: 400,
            flexWrap: "wrap",
          }}>
            <TrustItem label="600+ ลูกค้าฤดูกาลนี้" />
            <TrustItem label="4.9 ★ บน Google" />
            <TrustItem label="มือใหม่ก็พายได้" />
            <TrustItem label="รวมถ่ายภาพ" />
          </div>
        </div>
      </div>
    </section>
  );
}
