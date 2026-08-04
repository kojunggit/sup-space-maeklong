"use client";

import { useLang } from "./lang-context";
import { T } from "./translations";
import { useCampaignBarVisible } from "./useCampaignBar";
import { CAMPAIGN_BAR_HEIGHT } from "./campaign-config";
import DanceChallengeJoinButton from "./DanceChallengeJoinButton";

export default function CampaignBar({ remainingSlots }: { remainingSlots: number }) {
  const { lang } = useLang();
  const t = T[lang].danceChallenge;
  const [visible, dismiss] = useCampaignBarVisible();

  if (!visible) return null;

  return (
    <div
      role="banner"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 60,
        height: CAMPAIGN_BAR_HEIGHT,
        background: "var(--campaign-accent)",
        color: "#fff",
        display: "flex", alignItems: "center",
        padding: "0 12px 0 16px",
        gap: 12,
      }}
    >
      <a
        href="/dance-challenge"
        style={{
          flex: 1, minWidth: 0,
          fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 13,
          color: "#fff", textDecoration: "none",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}
      >
        {t.barText(remainingSlots)}
      </a>

      <DanceChallengeJoinButton
        label={t.barCta}
        style={{
          flexShrink: 0,
          background: "#fff", color: "var(--campaign-accent)",
          fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 12,
          padding: "5px 12px", borderRadius: 999,
          whiteSpace: "nowrap",
        }}
      />

      <button
        onClick={dismiss}
        aria-label={lang === "th" ? "ปิด" : "Dismiss"}
        style={{
          flexShrink: 0,
          background: "transparent", border: "none", color: "#fff",
          opacity: 0.85, cursor: "pointer", fontSize: 16, lineHeight: 1,
          padding: 4,
        }}
      >
        ✕
      </button>
    </div>
  );
}
