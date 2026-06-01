"use client";

import { useState } from "react";

// เพิ่มรูปได้เรื่อย ๆ แค่เพิ่มรายการในนี้ — ตั้ง big: true เพื่อให้รูปนั้นกินพื้นที่ใหญ่ขึ้น
const SHOTS = [
  { src: "/images/KOSI2067.jpg", cap: "อุโมงป่าจาก",   big: true  },
  { src: "/images/KOSI4747.jpg", cap: "วัดบางน้อย"                },
  { src: "/images/KOSI4714.jpg", cap: "น้ำใส"                     },
  { src: "/images/KOSI6162.jpg", cap: "กลุ่มเพื่อน"               },
  { src: "/images/KOSI6383.jpg", cap: "ผจญภัยริมคลอง", big: true  },
  { src: "/images/KOSI6260.jpg", cap: "พายยามเช้า"               },
  { src: "/images/KOSI4884.jpg", cap: "สายน้ำยามบ่าย", big: true  },
  { src: "/images/KOSI1064.jpg", cap: "ริมคลองแม่กลอง"           },
  { src: "/images/KOSI3797.jpg", cap: "วิถีชุมชน"                 },
  { src: "/images/KOSI4709.jpg", cap: "พายเป็นหมู่คณะ"           },
  { src: "/images/KOSI3997.jpg", cap: "สวนมะพร้าวริมน้ำ"         },
  { src: "/images/KOSI4923.jpg", cap: "ช่วงเวลาสงบ",   big: true  },
  { src: "/images/KOSI4808.jpg", cap: "ออกผจญภัย"                 },
  { src: "/images/KOSI5933.jpg", cap: "ธรรมชาติสองฝั่ง"          },
  { src: "/images/KOSI5971.jpg", cap: "แสงเช้าริมคลอง"           },
  { src: "/images/KOSI6689.jpg", cap: "ความทรงจำบนน้ำ"           },
];

function Cell({ src, cap, big }: { src: string; cap: string; big?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        gridColumn: big ? "span 2" : "span 1",
        gridRow: big ? "span 2" : "span 1",
        position: "relative", borderRadius: 12, overflow: "hidden",
        background: `url(${src}) center/cover`, cursor: "pointer",
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-md)",
        transition: "all 240ms var(--ease-out)",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg,rgba(26,32,44,0) 30%,rgba(26,32,44,0.78) 100%)",
        opacity: hover ? 1 : 0.6,
        transition: "opacity 240ms var(--ease-out)",
      }} />
      <div style={{
        position: "absolute", bottom: 14, left: 16, right: 16,
        color: "#fff", fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 20,
        textShadow: "0 2px 12px rgba(0,0,0,0.6)",
        transform: hover ? "translateY(0)" : "translateY(6px)",
        opacity: hover ? 1 : 0.85,
        transition: "all 240ms var(--ease-out)",
      }}>{cap}</div>
    </div>
  );
}

export default function Gallery() {
  return (
    <section id="gallery" style={{ background: "var(--bg-page)" }} className="section-pad">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow">สัปดาห์ที่แล้ว</div>
            <h2 className="section-title">เรา<span className="accent">ถ่ายให้</span></h2>
            <p className="section-sub">บางส่วนจากสัปดาห์ที่แล้ว · ทีมเราถ่ายทั้งหมดบนน้ำ ไม่มีการจัดท่า</p>
          </div>
          <a href="#book" className="btn btn-secondary">มาให้เราถ่ายให้ →</a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gridAutoRows: "220px",
            gridAutoFlow: "dense",
            gap: 14,
          }}
          className="gallery-grid"
        >
          {SHOTS.map((s) => <Cell key={s.src} {...s} />)}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .gallery-grid {
            grid-template-columns: 1fr 1fr !important;
            grid-auto-rows: 180px !important;
          }
        }
      `}</style>
    </section>
  );
}
