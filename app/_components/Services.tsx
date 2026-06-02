"use client";

import { useState } from "react";
import { useLang } from "./lang-context";
import { T } from "./translations";

const CARD_ACCENTS = ["var(--sup-teal)", "var(--sup-orange)", "var(--orange-600)", "var(--sup-dark)"] as const;
const CARD_IMGS    = ["/images/KOSI4747.jpg", "/images/KOSI6260.jpg", "/images/KOSI6162.jpg", "/images/KOSI4714.jpg"] as const;
const CARD_HREFS   = ["/routes", undefined, undefined, undefined] as const;

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
  bullets: readonly string[]; accent: string; img: string; badge?: string; href?: string; linkText?: string;
}

function ServiceCard({ eyebrow, title, desc, bullets, accent, img, badge, href, linkText }: ServiceCardProps) {
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
        {href && (
          <a
            href={href}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 16, fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 500,
              color: accent, textDecoration: "none", letterSpacing: "0.02em",
              transition: "gap 160ms ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.gap = "10px"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.gap = "6px"; }}
          >
            {linkText ?? "ดูเส้นทางทั้งหมด"} <span style={{ fontSize: 15 }}>→</span>
          </a>
        )}
      </div>
    </div>
  );
}

export default function Services() {
  const { lang } = useLang();
  const t = T[lang].services;
  const SERVICES = t.cards.map((card, i) => ({
    ...card,
    accent: CARD_ACCENTS[i],
    img:    CARD_IMGS[i],
    href:   CARD_HREFS[i],
  }));

  return (
    <section id="services" style={{ background: "var(--bg-page)" }} className="section-pad">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 44, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2 className="section-title">{t.title.pre}<span className="accent">{t.title.accent}</span>{t.title.post}</h2>
            <p className="section-sub">{t.sub}</p>
          </div>
          <a href="#book" className="btn btn-secondary">{t.priceCta}</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
          {SERVICES.map((s) => <ServiceCard key={s.title} {...s} />)}
        </div>

        <div style={{ marginTop: 32, padding: "24px 28px", background: "var(--sup-dark)", color: "#fff", borderRadius: 12, display: "flex", gap: 32, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--sup-orange)" }}>{t.packageEyebrow}</div>
            <h3 style={{ margin: "6px 0 4px", fontFamily: "var(--font-kanit)", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>{t.packageTitle}</h3>
            <p style={{ margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.55 }}>{t.packageDesc}</p>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <PackageBadge title={t.pkg1Title} price="2,900" hint={t.pkg1Hint} />
            <PackageBadge title={t.pkg2Title} price="3,500" hint={t.pkg2Hint} highlight />
          </div>
        </div>
      </div>
    </section>
  );
}
