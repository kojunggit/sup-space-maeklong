"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "./lang-context";
import { T } from "./translations";
import { isCampaignActive } from "./campaign-config";

interface HeroProps {
  onBookClick: () => void;
  rating: number;
  reviewCount: number;
  participants: number;
}

const AVATARS = [
  { initials: "ก", bg: "#008080" },
  { initials: "ต", bg: "#FF8C00" },
  { initials: "พ", bg: "#006B6B" },
  { initials: "S", bg: "#B85F00" },
];

export default function Hero({ onBookClick, rating, reviewCount, participants }: HeroProps) {
  const { lang } = useLang();
  const t = T[lang].hero;
  const dc = T[lang].danceChallenge;

  // Split title on "SUP" to apply accent span
  const [titleBefore, titleAfter] = t.title.split("SUP");

  return (
    <section id="home" className="hero">
      <Image
        src="/images/KOSI2067.jpg"
        alt="พาย SUP ผ่านตลาดน้ำและคลองที่แม่กลอง สมุทรสงคราม — SUP Maeklong paddle board floating market tour near Bangkok, Thailand"
        fill
        priority
        sizes="100vw"
        quality={70}
        style={{ objectFit: "cover", objectPosition: "center 35%" }}
      />
      <div className="hero__overlay" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__badge">
            <span className="hero__badge-dot" aria-hidden="true" />
            {t.badge}
          </p>

          <h1 className="hero__title">
            {titleBefore}<span className="hero__title-accent">SUP</span>{titleAfter}
          </h1>

          <p className="hero__subtitle">{t.subtitle}</p>

          <ul className="hero__trust" aria-label={lang === "th" ? "จุดเด่นของทริป" : "Trip highlights"}>
            {t.trust.map((point) => (
              <li key={point} className="hero__trust-item">
                <span className="hero__trust-check" aria-hidden="true">✓</span>
                {point}
              </li>
            ))}
          </ul>

          <div className="hero__cta">
            <button onClick={onBookClick} className="btn btn-primary hero__cta-primary">
              {t.ctaPrimary}
            </button>
            <Link href="/routes" className="btn hero__cta-secondary">
              {t.ctaSecondary}
            </Link>
          </div>

          <div className="hero__proof">
            <div className="hero__avatars" aria-hidden="true">
              {AVATARS.map((a, i) => (
                <span key={i} className="hero__avatar" style={{ background: a.bg }}>
                  {a.initials}
                </span>
              ))}
            </div>
            <div className="hero__proof-text">
              <span className="hero__rating">
                <span aria-hidden="true" className="hero__stars">★★★★★</span>
                <strong>{rating.toFixed(1)}</strong>
                <span className="hero__proof-muted">{t.proofReviews(reviewCount)}</span>
              </span>
              <span className="hero__proof-muted">{t.proofPaddlers}</span>
              {isCampaignActive() && (
                <span className="hero__proof-muted" style={{ color: "var(--campaign-accent)", fontWeight: 500 }}>
                  {dc.proofLine(participants)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
