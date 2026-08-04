"use client";

import Image from "next/image";
import { useLang } from "./lang-context";
import { T } from "./translations";
import { isCampaignActive } from "./campaign-config";

const muted: React.CSSProperties = { fontFamily: "var(--font-kanit)", fontWeight: 300, margin: "6px 0", fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 };

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", color: "var(--sup-orange)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Social({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      width: 36, height: 36, borderRadius: 999,
      background: "rgba(255,255,255,0.10)", color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      textDecoration: "none", fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      border: "1px solid rgba(255,255,255,0.18)",
      transition: "all 180ms var(--ease-out)",
    }}>{label}</a>
  );
}

export default function Footer() {
  const { lang } = useLang();
  const t = T[lang].footer;

  return (
    <footer id="contact" style={{ background: "var(--sup-dark)", color: "#fff", position: "relative" }}>
      <img src="/wave-divider.svg" alt="" style={{ width: "100%", height: 60, display: "block", position: "absolute", top: -30, left: 0, right: 0, filter: "drop-shadow(0 6px 0 var(--sup-dark))" }} />
      <div className="container" style={{ padding: "80px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1fr", gap: 40, alignItems: "flex-start" }} className="footer-grid">
          <div>
            <Image src="/logo-mark.png" alt="SUP Space Maeklong" width={96} height={96} style={{ height: 96, width: "auto", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }} />
            <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, marginTop: 14, fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.78)", maxWidth: 340 }}>
              {t.tagline}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <Social label="LINE" href="https://line.me/R/ti/p/@256pyxrx" />
              <Social label="WA"   href="https://wa.me/66837146958" />
              <Social label="IG"   href="https://www.instagram.com/SUPSpaceMaeklong" />
              <Social label="FB"   href="https://www.facebook.com/SUPSpaceMaeklong" />
              <Social label="TT"   href="https://www.tiktok.com/@SUPSpaceMaeklong" />
            </div>
          </div>

          <FooterCol title={t.locTitle}>
            <p style={muted}>5/1 ม. 2 ต.ยายแดง</p>
            <p style={muted}>อ.บางคนที จ.สมุทรสงคราม 75120</p>
            <a
              href="https://maps.app.goo.gl/8Efgsjp3EocP9gRb9"
              target="_blank" rel="noopener noreferrer"
              style={{ ...muted, color: "var(--sup-orange)", textDecoration: "none", display: "inline-block", marginTop: 4 }}
            >
              {t.mapLink}
            </a>
          </FooterCol>

          <FooterCol title={t.hoursTitle}>
            <p style={muted}>{t.hours}</p>
            <p style={{ ...muted, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{t.hoursNote}</p>
          </FooterCol>

          <FooterCol title={t.contactTitle}>
            <p style={{ ...muted, fontFamily: "var(--font-inter)", fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>083-714-6958</p>
            <p style={muted}>mrkosit@gmail.com</p>
            <p style={muted}>LINE : @256pyxrx</p>
            <p style={muted}>WhatsApp : 083-714-6958</p>
            <a href="#book" className="btn btn-primary" style={{ marginTop: 10, padding: "10px 20px", fontSize: 13 }}>{t.bookCta}</a>
          </FooterCol>
        </div>

        <div style={{
          marginTop: 56, paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "var(--font-kanit)", fontWeight: 300,
          fontSize: 12, color: "rgba(255,255,255,0.55)",
          flexWrap: "wrap", gap: 12,
        }}>
          <span>{t.copyright}</span>
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>
            {lang === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy"}
          </a>
          {isCampaignActive() && (
            <a href="/dance-challenge/rules" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>
              {T[lang].danceChallenge.footerLink}
            </a>
          )}
          <span style={{ color: "var(--sup-orange)", fontWeight: 400 }}>{t.footerLine}</span>
        </div>
      </div>

      <style>{`@media (max-width: 760px) { .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }`}</style>
    </footer>
  );
}
