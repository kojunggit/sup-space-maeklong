"use client";

import { useLang } from "./lang-context";
import { T } from "./translations";

export default function DanceChallengeNavBadge() {
  const { lang } = useLang();
  const t = T[lang].danceChallenge;

  return (
    <a
      href="/dance-challenge"
      style={{
        position: "relative",
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px",
        borderRadius: 999,
        background: "var(--campaign-accent-soft)",
        color: "var(--campaign-accent)",
        textDecoration: "none",
        fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {t.navLabel}
      <span
        aria-hidden="true"
        style={{
          width: 7, height: 7, borderRadius: 999,
          background: "var(--danger)",
        }}
      />
    </a>
  );
}
