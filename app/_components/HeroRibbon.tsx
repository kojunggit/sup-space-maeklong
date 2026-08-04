"use client";

import Image from "next/image";
import { useLang } from "./lang-context";
import { T } from "./translations";
import { CAMPAIGN_END_DATE } from "./campaign-config";
import { useCountdown } from "./useCountdown";

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 38 }}>
      <span style={{ fontFamily: "var(--font-inter)", fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
        {String(value).padStart(2, "0")}
      </span>
      <span style={{ fontFamily: "var(--font-kanit)", fontSize: 10, fontWeight: 300, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
        {label}
      </span>
    </div>
  );
}

export default function HeroRibbon({ remainingSlots }: { remainingSlots: number }) {
  const { lang } = useLang();
  const t = T[lang].danceChallenge;
  const countdown = useCountdown(CAMPAIGN_END_DATE);

  return (
    // Bottom padding is deliberately generous: <BookingSection/> (rendered right
    // after this) pulls itself up by 120px to overlap the hero above it — this
    // buffer keeps that overlap landing in empty page background, not on the card.
    <section style={{ background: "var(--bg-page)", padding: "56px 24px 168px" }}>
      <a
        href="/dance-challenge"
        className="container"
        style={{
          display: "block",
          position: "relative",
          borderRadius: 20,
          margin: "0 auto",
          overflow: "hidden",
          boxShadow: "0 12px 32px rgba(255,107,91,0.28)",
        }}
      >
        <Image
          src="/images/bannerpaipaipai_landscape.png"
          alt={t.ribbonHeading}
          width={3712}
          height={1152}
          style={{ width: "100%", height: "auto", display: "block" }}
          sizes="(max-width: 900px) 100vw, 900px"
          priority
        />

        {/* In normal flow (not absolutely positioned over the image) so wrapped
            content on narrow phones grows the bar downward instead of clipping
            upward past the image's top edge. marginTop pulls it flush against
            the image with no visible seam; the gradient still reads as "on" the banner. */}
        <div
          className="ribbon-info-bar"
          style={{
            marginTop: -40,
            background: "linear-gradient(180deg, rgba(10,16,32,0) 0%, rgba(10,16,32,0.82) 55%, rgba(10,16,32,0.92) 100%)",
            padding: "48px 20px 16px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flexWrap: "wrap",
          }}
        >
          {countdown.ended ? (
            <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 14, color: "#fff" }}>
              {t.countdownEnded}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <CountdownUnit value={countdown.days} label={t.countdownDays} />
              <CountdownUnit value={countdown.hours} label={t.countdownHours} />
              <CountdownUnit value={countdown.minutes} label={t.countdownMinutes} />
              <CountdownUnit value={countdown.seconds} label={t.countdownSeconds} />
            </div>
          )}

          <div className="ribbon-divider" style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.25)" }} />

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--campaign-accent)", borderRadius: 999,
            padding: "7px 16px",
            fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 700, color: "#fff",
            whiteSpace: "nowrap",
          }}>
            {t.ribbonSlots(remainingSlots)}
          </div>
        </div>
      </a>

      <style>{`
        @media (max-width: 420px) {
          .ribbon-info-bar { flex-direction: column; gap: 12px !important; }
          .ribbon-divider { display: none; }
        }
      `}</style>
    </section>
  );
}
