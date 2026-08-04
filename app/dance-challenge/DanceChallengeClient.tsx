"use client";

import Image from "next/image";
import { LangProvider, useLang } from "@/app/_components/lang-context";
import { T } from "@/app/_components/translations";
import Footer from "@/app/_components/Footer";
import CampaignBar from "@/app/_components/CampaignBar";
import DanceChallengeJoinButton from "@/app/_components/DanceChallengeJoinButton";
import { useCampaignBarVisible } from "@/app/_components/useCampaignBar";
import { useCountdown } from "@/app/_components/useCountdown";
import {
  CAMPAIGN_BAR_HEIGHT, CAMPAIGN_END_DATE, SONG_URL,
} from "@/app/_components/campaign-config";
import type { CampaignStats } from "@/app/actions/campaign";

function LangToggle() {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      aria-label={lang === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "transparent", border: "1px solid var(--border-2)",
        borderRadius: 999, padding: "6px 12px", cursor: "pointer",
        fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600, color: "var(--fg-2)",
      }}
    >
      <span style={{ opacity: lang === "th" ? 1 : 0.45 }}>TH</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span style={{ opacity: lang === "en" ? 1 : 0.45 }}>EN</span>
    </button>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 60 }}>
      <span style={{ fontFamily: "var(--font-inter)", fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
        {String(value).padStart(2, "0")}
      </span>
      <span style={{ fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
        {label}
      </span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 24,
      color: "var(--fg-1)", textAlign: "center", margin: "0 0 28px",
    }}>
      {children}
    </h2>
  );
}

function JoinCta({ label }: { label: string }) {
  return (
    <DanceChallengeJoinButton
      label={label}
      className="btn"
      style={{
        background: "var(--campaign-accent)", color: "#fff",
        padding: "14px 32px", fontSize: 16, fontWeight: 700,
        boxShadow: "0 8px 24px rgba(255,107,91,0.35)",
      }}
    />
  );
}

function DanceChallengeBody({ campaignStats }: { campaignStats: CampaignStats }) {
  const { lang } = useLang();
  const t = T[lang].danceChallenge;
  const rp = T[lang].routesPage;
  const [barVisible] = useCampaignBarVisible();
  const countdown = useCountdown(CAMPAIGN_END_DATE);

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <CampaignBar remainingSlots={campaignStats.remainingSlots} />

      {/* ── Minimal nav ─────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: barVisible ? CAMPAIGN_BAR_HEIGHT : 0, zIndex: 50,
        transition: "top 200ms var(--ease-out)",
        background: "rgba(251,250,241,0.92)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        borderBottom: "1px solid var(--border-1)",
        boxShadow: "0 1px 0 rgba(26,32,44,0.06)",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--fg-1)" }}>
            <Image src="/logo-mark.png" alt="SUP Space Maeklong" width={44} height={44} style={{ height: 44, width: "auto" }} />
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LangToggle />
            <a href="/" style={{ fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-2)", textDecoration: "none", fontWeight: 400 }}>
              {rp.navHome}
            </a>
          </div>
        </div>
      </header>

      {/* ── 1. Campaign hero ────────────────────────────────────────────── */}
      <section style={{ background: "var(--sup-dark)", position: "relative", overflow: "hidden" }}>
        <Image
          src="/images/bannerpaipaipai_landscape.png"
          alt={t.pageHeroHeading}
          width={3712}
          height={1152}
          style={{ width: "100%", height: "auto", display: "block" }}
          sizes="100vw"
          priority
        />
        <div style={{
          position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,91,0.25) 0%, transparent 70%)", pointerEvents: "none",
        }} />
        <div className="container" style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "40px 24px 48px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)",
            fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--campaign-accent)",
          }}>
            {t.pageHeroBadge}
          </div>
          <h1 style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: "#fff", margin: 0, maxWidth: 640 }}>
            {t.pageHeroHeading}
          </h1>
          <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 16, color: "rgba(255,255,255,0.82)", maxWidth: 560, margin: 0, lineHeight: 1.6 }}>
            {t.pageHeroSub}
          </p>

          {countdown.ended ? (
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 16, color: "#fff" }}>{t.countdownEnded}</div>
          ) : (
            <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
              <CountdownUnit value={countdown.days} label={t.countdownDays} />
              <CountdownUnit value={countdown.hours} label={t.countdownHours} />
              <CountdownUnit value={countdown.minutes} label={t.countdownMinutes} />
              <CountdownUnit value={countdown.seconds} label={t.countdownSeconds} />
            </div>
          )}

          <JoinCta label={t.joinCta} />
        </div>
      </section>

      {/* ── 2. Listen to the song ───────────────────────────────────────── */}
      <section style={{ padding: "56px 24px" }}>
        <div className="container" style={{ maxWidth: 640, textAlign: "center" }}>
          <SectionHeading>{t.listenHeading}</SectionHeading>
          <a
            href={SONG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              background: "var(--campaign-accent-soft)", color: "var(--campaign-accent)",
              padding: "14px 28px", fontSize: 15, fontWeight: 700,
              border: "1.5px solid var(--campaign-accent)",
            }}
          >
            {t.listenCta}
          </a>
        </div>
      </section>

      {/* ── 3. How to join — 4 steps ────────────────────────────────────── */}
      <section style={{ padding: "16px 24px 56px", background: "var(--sand-50)" }}>
        <div className="container">
          <SectionHeading>{t.stepsHeading}</SectionHeading>
          <div className="dc-steps" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {t.steps.map((step, i) => (
              <Image
                key={i}
                src={`/images/card${i + 1}.png`}
                alt={step}
                width={2048}
                height={2048}
                style={{ width: "100%", height: "auto", display: "block", borderRadius: 14 }}
                sizes="(max-width: 760px) 100vw, 25vw"
              />
            ))}
          </div>

          {/* Step-by-step text description */}
          <ol style={{
            listStyle: "none", padding: 0,
            maxWidth: 640, margin: "36px auto 0",
            display: "grid", gap: 12,
          }}>
            {t.steps.map((step, i) => (
              <li key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                background: "#fff", borderRadius: 12, padding: "16px 18px",
                border: "1px solid var(--border-1)",
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                  background: "var(--campaign-accent)", color: "#fff",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 14,
                }}>
                  {i + 1}
                </span>
                <span style={{
                  fontFamily: "var(--font-kanit)", fontWeight: 400, fontSize: 15,
                  color: "var(--fg-1)", lineHeight: 1.65,
                }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 4. Reference dance video ────────────────────────────────────── */}
      <section style={{ padding: "56px 24px" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <SectionHeading>{t.videoHeading}</SectionHeading>
          <video
            src="/vdo/dance-challenge.mp4"
            controls
            playsInline
            preload="metadata"
            style={{
              display: "block", width: "100%", maxWidth: 320, maxHeight: "80vh",
              margin: "0 auto", borderRadius: 16, background: "var(--sup-dark)",
            }}
          />
          <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-3)", textAlign: "center", maxWidth: 480, margin: "20px auto 0", lineHeight: 1.7 }}>
            {t.videoCaption}
          </p>
        </div>
      </section>

      {/* ── 5. Reward cards ─────────────────────────────────────────────── */}
      <section style={{ padding: "16px 24px 56px", background: "var(--sand-50)" }}>
        <div className="container">
          <SectionHeading>{t.rewardsHeading}</SectionHeading>
          <div className="dc-rewards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 760, margin: "0 auto" }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 26, border: "1px solid var(--border-1)" }}>
              <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 18, color: "var(--fg-1)", marginBottom: 8 }}>{t.rewardATitle}</div>
              <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-2)", lineHeight: 1.6, margin: "0 0 14px" }}>{t.rewardABody}</p>
              <span style={{
                display: "inline-block", padding: "5px 12px", borderRadius: 999,
                background: "var(--campaign-accent-soft)", color: "var(--campaign-accent)",
                fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 700,
              }}>
                {t.rewardABadge}
              </span>
            </div>
            <div style={{ background: "var(--sup-dark)", borderRadius: 16, padding: 26 }}>
              <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 8 }}>{t.rewardBTitle}</div>
              <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: "0 0 14px" }}>{t.rewardBBody}</p>
              <span style={{
                display: "inline-block", padding: "5px 12px", borderRadius: 999,
                background: "rgba(255,107,91,0.22)", color: "var(--campaign-accent)",
                fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 700,
              }}>
                {t.rewardBBadge}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Repeated CTA (mid-page) ──────────────────────────────────── */}
      <section style={{ padding: "48px 24px", textAlign: "center" }}>
        <JoinCta label={t.joinCta} />
      </section>

      {/* ── 7. Link to full rules ───────────────────────────────────────── */}
      <section style={{ padding: "0 24px 48px", textAlign: "center" }}>
        <a href="/dance-challenge/rules" style={{ color: "var(--sup-teal)", fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 14, textDecoration: "underline" }}>
          {t.rulesLinkText}
        </a>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "16px 24px 64px", background: "var(--sand-50)" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <SectionHeading>{t.faqHeading}</SectionHeading>
          <div style={{ display: "grid", gap: 14 }}>
            {t.faq.map((item, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border-1)" }}>
                <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 15, color: "var(--fg-1)", marginBottom: 6 }}>{item.q}</div>
                <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-2)", lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── End-of-page CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: "8px 24px 56px", textAlign: "center" }}>
        <JoinCta label={t.joinCta} />
      </section>

      <Footer />

      <style>{`
        @media (max-width: 760px) {
          .dc-steps { grid-template-columns: 1fr !important; }
          .dc-rewards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function DanceChallengeClient({ campaignStats }: { campaignStats: CampaignStats }) {
  return (
    <LangProvider>
      <DanceChallengeBody campaignStats={campaignStats} />
    </LangProvider>
  );
}
