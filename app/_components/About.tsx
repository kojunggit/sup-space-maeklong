"use client";

import { useLang } from "./lang-context";
import { T } from "./translations";

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-inter)", fontSize: 44, fontWeight: 700, lineHeight: 1.0, color: "var(--sup-teal)", letterSpacing: "-0.02em" }}>{n}</div>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-2)", fontWeight: 400, marginTop: 6 }}>{label}</div>
    </div>
  );
}

export default function About({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const { lang } = useLang();
  const t = T[lang].about;

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
                <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 12, color: "var(--fg-3)" }}>{t.reviewCount(reviewCount)}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2 className="section-title">
              {t.title.pre}
              <span className="accent" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{t.title.accent}</span>
              {t.title.post}
            </h2>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 400, fontSize: 17, lineHeight: 1.7, color: "var(--fg-1)", margin: "12px 0 18px" }}>
              {t.p1}
            </p>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 16, lineHeight: 1.75, color: "var(--fg-2)", margin: "0 0 16px" }}>
              {t.p2}
            </p>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 16, lineHeight: 1.75, color: "var(--fg-2)", margin: "0 0 16px" }}>
              {t.p3}
            </p>
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 16, lineHeight: 1.75, color: "var(--fg-2)", margin: "0 0 28px" }}>
              {t.p4}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              <Stat n={t.s1n} label={t.s1l} />
              <Stat n={t.s2n} label={t.s2l} />
              <Stat n={t.s3n} label={t.s3l} />
            </div>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 880px) { .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
    </section>
  );
}
