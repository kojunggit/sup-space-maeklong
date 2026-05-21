import Link from "next/link";
import Image from "next/image";
import { ROUTES, CATEGORIES, type Route } from "@/app/_components/trips-data";

// ─── Rich descriptions (from PDF) ─────────────────────────────────────────────

const DESC: Record<string, string> = {
  phoprak:
    "เส้นทางพายเข้าสู่คลองเม็ง ชมธรรมชาติสวนมะพร้าว และวิถีชีวิตริมน้ำ จอดพักดื่มกาแฟจากร้านกาแฟสวยๆ ที่มีเมล็ดกาแฟให้เลือกหลากหลาย ทิวทัศน์สองข้างทางร่มรื่น เหมาะสำหรับมือใหม่และคนที่อยากสัมผัสบรรยากาศริมคลองแบบชิลๆ",
  pakhiao:
    "เส้นทางพายเข้าคลองเม็ง แล้วเลี้ยวขวาไปร้านหอยทอดป้าเขียวที่ขายมานานมากกว่า 40 ปี นอกจากหอยทอดแสนอร่อยแล้ว ยังมีอาหารที่หลากหลายให้เลือกทาน รวมทั้งกาแฟและเครื่องดื่มราคาน่ารัก หากโชคดีอาจได้เมนูกุ้งเผาพร้อมน้ำจิ้มสุดแซบอีกด้วย",
  kaodrip:
    "เส้นทางพายระยะสั้นๆ น่ารักๆ แวะร้านกาแฟเล็กๆ บรรยากาศในสวน เจ้าของร้านอารมณ์ดีและเป็นกันเอง เหมาะสำหรับคนที่อยากพายเบาๆ และจิบกาแฟชมวิว",
  prokcharoen:
    "เส้นทางระยะสั้น เหมาะสำหรับพาเด็กๆ พาย เราจะพายไปวัดปรกเจริญ แวะให้อาหารปลาในลำน้ำ และไหว้พระขอพรก่อนพายกลับแบบชิลๆ ไม่ต้องการทักษะพายสูง มือใหม่พาเด็กมาได้เลย",
  rongsuan:
    "เส้นทางไปตลาดนัดเปิดใหม่ที่เน้นของกินราคาน่ารักแต่รสชาติน่ายกนิ้วให้ ตลาดนัดร่องสวนยายแพงเปิดให้บริการเฉพาะวันเสาร์-อาทิตย์ เส้นทางนี้จึงเหมาะสำหรับทริปสุดสัปดาห์",
  damnoenpwa:
    "เส้นทางสำหรับทริประยะสั้นรอบเย็น แวะร้านอาหารริมน้ำที่บรรยากาศโรแมนติก เส้นทางนี้แม้จะดูไม่ไกลแต่กระแสน้ำค่อนข้างแรง และมีการพายทวนน้ำครึ่งทาง ได้ออกกำลังกายจนหลับสบายแน่นอน",
  thaka:
    "เส้นทางที่พาให้เราได้พบกับความสวยงามและร่มรื่นของคลองบ้านใต้ และวิถีชีวิตเรียบง่ายของชาวสวน จุดหมายปลายทางคือตลาดน้ำโบราณที่ยังคงความเป็นวิถีชุมชนอยู่ มีอาหารอร่อยๆ และสินค้าเกษตรที่พ่อค้าแม่ค้าพายเรือมาขาย",
  damnoen:
    "เราจะเริ่มที่วัดโชติทายการาม พายเข้าสู่ตลาดน้ำดำเนินสะดวก ชมตลาดน้ำในตำนาน แวะชมเตาตาลบังเละ และพายกลับมาจบที่ SUP Space Maeklong เส้นทางนี้เต็มไปด้วยบรรยากาศย้อนยุคและวิถีชีวิตดั้งเดิมของชาวสมุทรสงคราม",
  bangnoi:
    "เส้นทางพายสำหรับช่วงน้ำลง เราจะล่องไปตามสายน้ำในคลองบางน้อย แวะพักที่ตลาดน้ำบางน้อย จากนั้นเดินทางต่อไปจบที่ร้าน Somdul Bee Sanctuary (6 กม) หรือสะพานแขวนวัดปากน้ำ (7 กม) แล้วแต่ลูกค้าเลือก จากนั้นนั่งรถกลับมาที่จุดเริ่มต้น",
  watyai:
    "เส้นทางพายชมแลนด์มาร์คแห่งใหม่ของสมุทรสงคราม สะพานปลาทูหรือสะพานแขวนวัดใหญ่ เส้นทางนี้เราจะพายล่องไปตามแม่น้ำแม่กลองเป็นส่วนใหญ่ กระแสน้ำสงบ พายง่าย เหมาะสำหรับผู้ที่เคยพายมาแล้ว",
  "three-mkts":
    "เราจะพายชม 3 ตลาดน้ำที่ดังที่สุดของสมุทรสงคราม ได้แก่ ตลาดน้ำอัมพวา, ตลาดน้ำท่าคา, และตลาดน้ำบางน้อย เป็นเส้นทางที่มีการผจญภัยครบรส ผ่านทั้งคลองแคบ แม่น้ำกว้าง และวิถีชีวิตชุมชนที่หลากหลาย",
  bangruahak:
    "เส้นทางพายผ่านอุโมงป่าจากในคลองบางเรือหัก คลองที่กระแสน้ำมีความท้าทายสูง จากนั้นพายออกคลองประชาชมชื่น เข้าสู่แม่น้ำแม่กลอง รวมระยะทาง 20 กม เหมาะสำหรับนักพายที่มีประสบการณ์และต้องการความท้าทาย",
  khaoyisarn:
    "เราจะเริ่มลงพายที่เขายี่สาร ชมบรรยากาศวิถีชีวิตคนเผาถ่านที่มีธุรกิจแบบ sustainable พายชมธรรมชาติร่มรื่นและสวยงาม แวะทานอาหารที่ปลายทางร้านข้าวใหม่ปลามัน ก่อนพายกลับมาที่เขายี่สาร",
};

const WARNINGS: Record<string, string> = {
  damnoen: "⚠ ควรเริ่มพายก่อน 08:00 น. — การพายเข้าตลาดน้ำดำเนินสะดวกหลัง 09:00 น. จะมีการจราจรทางน้ำที่คับคั่งและค่อนข้างอันตรายสำหรับผู้ที่ไม่เคยพายมาก่อน",
  rongsuan: "📅 เปิดเฉพาะเสาร์–อาทิตย์ — ตลาดนัดร่องสวนยายแพงเปิดให้บริการเฉพาะวันหยุดสุดสัปดาห์",
  bangnoi:  "🌊 เหมาะช่วงน้ำลง — เส้นทางนี้พายง่ายและสนุกกว่าในช่วงน้ำลง",
  damnoenpwa: "🌊 กระแสน้ำแรง — เส้นทางนี้มีกระแสน้ำค่อนข้างแรงและต้องพายทวนน้ำครึ่งทาง",
};

// Category accent colors
const CAT_ACCENT: Record<string, string> = {
  short:  "var(--sup-teal)",
  medium: "var(--sup-orange)",
  long:   "var(--sup-dark)",
};
const CAT_BG: Record<string, string> = {
  short:  "var(--teal-50)",
  medium: "#FFF4E5",
  long:   "#F0F2F5",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 999,
      background: "var(--sand-50)", border: "1px solid var(--border-1)",
      fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, color: "var(--fg-2)",
      whiteSpace: "nowrap",
    }}>
      {icon} {label}
    </span>
  );
}

function RouteCard({ route }: { route: Route }) {
  const accent = CAT_ACCENT[route.cat];
  const desc   = DESC[route.id] ?? route.note;
  const warn   = WARNINGS[route.id];

  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1px solid var(--border-1)",
      boxShadow: "var(--shadow-sm)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      transition: "box-shadow 220ms var(--ease-out), transform 220ms var(--ease-out)",
    }}
      className="route-card"
    >
      {/* Colored top stripe */}
      <div style={{ height: 4, background: accent, flexShrink: 0 }} />

      <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <h3 style={{
            margin: 0, fontFamily: "var(--font-kanit)", fontSize: 18, fontWeight: 700,
            color: "var(--fg-1)", lineHeight: 1.3,
          }}>
            {route.name}
          </h3>
          {route.recommend && (
            <span style={{
              flexShrink: 0, background: "var(--sup-orange)", color: "#fff",
              fontFamily: "var(--font-inter)", fontSize: 9, fontWeight: 700,
              padding: "3px 8px", borderRadius: 999, letterSpacing: "0.06em",
              textTransform: "uppercase", marginTop: 3,
            }}>RECOMMEND</span>
          )}
        </div>

        {/* Description */}
        <p style={{
          margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300,
          fontSize: 14, color: "var(--fg-2)", lineHeight: 1.7, flex: 1,
        }}>
          {desc}
        </p>

        {/* Warning */}
        {warn && (
          <div style={{
            padding: "10px 13px", borderRadius: 8,
            background: "#FFFBE6", border: "1px solid #FFE58F",
            fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 400,
            color: "#7C5600", lineHeight: 1.55,
          }}>
            {warn}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <StatChip icon="📍" label={`${route.km} กม`} />
          <StatChip icon="⏱" label={`${route.duration} ชม`} />
        </div>

        {/* Price + CTA */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 12, borderTop: "1px dashed var(--border-1)", gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 22, color: accent, lineHeight: 1 }}>
              ฿{route.price.toLocaleString()}
            </div>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>
              / บอร์ด
            </div>
          </div>
          <a href="/#book" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 16px", borderRadius: 9,
            background: accent, color: "#fff",
            fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 150ms",
          }}
            className="book-btn"
          >
            จองทริปนี้ →
          </a>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ cat, label, sub, skill, routes }: {
  cat: string; label: string; sub: string; skill: string;
  routes: Route[];
}) {
  const accent = CAT_ACCENT[cat];
  const bg     = CAT_BG[cat];

  return (
    <section style={{ marginBottom: 64 }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 20, marginBottom: 28, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: bg, border: `2px solid ${accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: "var(--font-kanit)", fontSize: 15, fontWeight: 700, color: accent }}>
              {label}
            </span>
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 3,
            }}>
              ทริประยะ{label}
            </div>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-2)", fontWeight: 300 }}>
              {sub} · {skill}
            </div>
          </div>
        </div>
        <div style={{
          padding: "8px 16px", borderRadius: 999,
          background: bg, border: `1px solid ${accent}`,
          fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
          color: accent, whiteSpace: "nowrap",
        }}>
          {routes.length} เส้นทาง
        </div>
      </div>

      {/* Cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 18,
      }}>
        {routes.map((r) => <RouteCard key={r.id} route={r} />)}
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "13 เส้นทางพาย | SUP Space Maeklong",
  description: "เส้นทางพายซับบอร์ดริมแม่กลองทั้งหมด ทั้งระยะใกล้ กลาง และไกล พร้อมรายละเอียดและราคา",
};

export default function RoutesPage() {
  const byCategory = (cat: string) => ROUTES.filter((r) => r.cat === cat);

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>

      {/* ── Minimal nav ─────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(251,250,241,0.92)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        borderBottom: "1px solid var(--border-1)",
        boxShadow: "0 1px 0 rgba(26,32,44,0.06)",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--fg-1)" }}>
            <Image src="/logo-mark.png" alt="SUP Space Maeklong" width={44} height={44} style={{ height: 44, width: "auto" }} />
            <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 15, display: "none" }} className="nav-brand">SUP Space Maeklong</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/" style={{ fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-2)", textDecoration: "none", fontWeight: 400, display: "flex", alignItems: "center", gap: 5 }}>
              ← หน้าหลัก
            </a>
            <a href="/#book" className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 14 }}>
              จองทริปเลย →
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--sup-dark)",
        padding: "72px 24px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative gradient blob */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,128,128,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: "30%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,0,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.22)",
            fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sup-orange)",
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--sup-orange)", display: "inline-block" }} />
            SUP Space Maeklong · แม่กลอง สมุทรสงคราม
          </div>

          <h1 style={{
            fontFamily: "var(--font-kanit)", fontWeight: 700,
            fontSize: 52, lineHeight: 1.1, letterSpacing: "-0.02em",
            color: "#fff", margin: "0 0 16px",
          }}>
            13 เส้นทาง<span style={{ color: "var(--sup-orange)" }}>พายซับ</span>
            <br />
            <span style={{ fontWeight: 300, fontSize: 28, color: "rgba(255,255,255,0.78)" }}>
              ริมแม่กลอง · สมุทรสงคราม
            </span>
          </h1>

          <p style={{
            fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 17,
            color: "rgba(255,255,255,0.85)", lineHeight: 1.65, maxWidth: 580,
            margin: "0 0 36px",
          }}>
            สั้น กลาง ไกล — ตั้งแต่กาแฟริมคลองเม็ง ไปจนถึงผจญภัย 3 ตลาดน้ำ 25 กม
            มือใหม่ก็พายได้ · ทีมไกด์รู้น้ำขึ้นน้ำลง · รวมถ่ายภาพ
          </p>

          {/* Category quick-jump */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <a key={c.id} href={`#cat-${c.id}`} style={{
                padding: "10px 18px", borderRadius: 999, textDecoration: "none",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.25)",
                fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 500,
                color: "#fff", transition: "background 160ms",
                display: "flex", alignItems: "center", gap: 8,
              }}
                className="cat-jump"
              >
                <span style={{
                  background: CAT_ACCENT[c.id], width: 8, height: 8,
                  borderRadius: 999, display: "inline-block",
                }} />
                ระยะ{c.label} · {c.sub}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Route sections ───────────────────────────────────────────────────── */}
      <main className="container" style={{ padding: "56px 24px" }}>

        {CATEGORIES.map((c) => (
          <div key={c.id} id={`cat-${c.id}`} style={{ scrollMarginTop: 80 }}>
            <CategorySection
              cat={c.id}
              label={c.label}
              sub={c.sub}
              skill={c.skill}
              routes={byCategory(c.id)}
            />
          </div>
        ))}

        {/* ── Custom trip ──────────────────────────────────────────────────── */}
        <section style={{
          padding: "36px 40px", borderRadius: 16,
          background: "linear-gradient(135deg, var(--teal-50) 0%, #FFF4E5 100%)",
          border: "1px solid var(--border-1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, flexWrap: "wrap", marginBottom: 24,
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--sup-teal)", marginBottom: 8,
            }}>
              CUSTOM YOUR OWN TRIP
            </div>
            <h2 style={{
              margin: "0 0 10px", fontFamily: "var(--font-kanit)", fontSize: 26,
              fontWeight: 700, color: "var(--fg-1)",
            }}>
              อยากได้เส้นทางแบบอื่น?
            </h2>
            <p style={{
              margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300,
              fontSize: 15, color: "var(--fg-2)", lineHeight: 1.65, maxWidth: 480,
            }}>
              นอกจากเส้นทางที่มีให้เลือกตามระยะทางแล้ว
              เรายังสามารถจัดเส้นทางพายให้เหมาะกับความต้องการของคุณได้อีกด้วย
              ติดต่อทีมงานเพื่อออกแบบทริปพิเศษสำหรับคุณโดยเฉพาะ
            </p>
          </div>
          <a href="/#contact" className="btn btn-primary" style={{ padding: "13px 24px", fontSize: 15, whiteSpace: "nowrap" }}>
            ติดต่อออกแบบทริป →
          </a>
        </section>

        {/* ── Healthy package teaser ────────────────────────────────────────── */}
        <section style={{
          padding: "28px 36px", borderRadius: 14,
          background: "var(--sup-dark)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--sup-orange)", marginBottom: 6,
            }}>
              SUP HEALTHY · แพคเกจรายเดือน
            </div>
            <p style={{
              margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300,
              fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.55,
            }}>
              พายบ่อยๆ ไม่จำกัดจำนวน ฿3,500/เดือน · หรือ 10 ครั้ง ฿2,900
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { title: "พาย 10 ครั้ง", price: "2,900", hint: "ครั้งละไม่เกิน 3 ชม" },
              { title: "รายเดือน ไม่จำกัด", price: "3,500", hint: "พายได้ไม่จำกัดจำนวน", hi: true },
            ].map((p) => (
              <div key={p.title} style={{
                padding: "12px 18px", borderRadius: 10,
                background: p.hi ? "var(--sup-orange)" : "rgba(255,255,255,0.08)",
                border: p.hi ? "none" : "1px solid rgba(255,255,255,0.18)",
                minWidth: 160,
              }}>
                <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, color: "#fff" }}>{p.title}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginTop: 4 }}>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>฿</span>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{p.price}</span>
                </div>
                <div style={{ fontFamily: "var(--font-kanit)", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2, fontWeight: 300 }}>{p.hint}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "var(--sup-dark)", color: "#fff",
        padding: "48px 24px 32px",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Image src="/logo-mark.png" alt="SUP Space Maeklong" width={52} height={52} style={{ height: 52, width: "auto" }} />
            <div>
              <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 16, color: "#fff" }}>
                SUP Space Maeklong
              </div>
              <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>
                คลองทองหลาง · แม่กลอง · สมุทรสงคราม 74000
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="/" style={{ fontFamily: "var(--font-kanit)", fontSize: 14, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>หน้าหลัก</a>
            <a href="/#book" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }}>จองทริปเลย</a>
          </div>
        </div>
        <div className="container" style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            © SUP Space Maeklong · พายซับมาตั้งแต่ 2562
          </span>
          <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 400, fontSize: 12, color: "var(--sup-orange)" }}>
            เจอกันที่แม่กลอง
          </span>
        </div>
      </footer>

      <style>{`
        .route-card:hover {
          box-shadow: var(--shadow-lg) !important;
          transform: translateY(-2px) !important;
        }
        .book-btn:hover { opacity: 0.85; }
        .cat-jump:hover { background: rgba(255,255,255,0.18) !important; }
        @media (max-width: 640px) {
          h1 { font-size: 36px !important; }
          h1 span:last-child { font-size: 20px !important; }
        }
        @media (min-width: 768px) {
          .nav-brand { display: inline !important; }
        }
      `}</style>
    </div>
  );
}
