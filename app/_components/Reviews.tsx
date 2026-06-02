"use client";

import type { PlaceReview } from "@/app/lib/google-places";
import Image from "next/image";
import { useLang } from "./lang-context";
import { T } from "./translations";

interface ReviewsProps {
  reviews: PlaceReview[];
  rating: number;
  reviewCount: number;
}

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <span aria-label={`${count} stars`} style={{ color: "#FFC273", fontSize: 14, letterSpacing: 1 }}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function ReviewCard({ review }: { review: PlaceReview }) {
  return (
    <article style={{
      background: "#fff", borderRadius: 14, border: "1px solid var(--border-1)",
      boxShadow: "var(--shadow-sm)", padding: "24px 26px",
      display: "flex", flexDirection: "column", gap: 14,
      flex: "0 0 auto", width: 340, maxWidth: "82vw",
      scrollSnapAlign: "start", transition: "box-shadow 220ms var(--ease-out)",
    }} className="review-card">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {review.authorPhoto ? (
          <Image src={review.authorPhoto} alt={review.authorName} width={42} height={42}
            style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: "var(--sup-teal)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 16, color: "#fff" }}>
            {review.authorName.charAt(0)}
          </div>
        )}
        <div>
          <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 15, color: "var(--fg-1)" }}>
            {review.authorName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <StarRow count={review.rating} />
            {review.relativeTime && (
              <span style={{ fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 300, color: "var(--fg-4)" }}>
                · {review.relativeTime}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", top: -8, left: -4, fontFamily: "Georgia, serif", fontSize: 48,
          color: "var(--teal-100)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}
          aria-hidden="true">"</span>
        <p style={{ margin: 0, paddingLeft: 20, fontFamily: "var(--font-kanit)", fontWeight: 300,
          fontSize: 15, lineHeight: 1.7, color: "var(--fg-2)" }}>
          {review.text}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
        <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600, color: "var(--fg-4)", letterSpacing: "0.04em" }}>
          Google Review
        </span>
      </div>
    </article>
  );
}

export default function Reviews({ reviews, rating, reviewCount }: ReviewsProps) {
  const { lang } = useLang();
  const t = T[lang].reviews;

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="section-pad" style={{ background: "var(--bg-page)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{t.eyebrow}</div>
          <h2 className="section-title" style={{ margin: "0 auto 12px", textAlign: "center" }}>
            {t.title.pre}<span className="accent">{t.title.accent}</span>{t.title.post}
          </h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 40, fontWeight: 700, color: "var(--sup-teal)", lineHeight: 1 }}>
              {rating.toFixed(1)}
            </span>
            <div>
              <StarRow count={5} />
              <p style={{ margin: "4px 0 0", fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-3)" }}>
                {t.fromCount(reviewCount)}
              </p>
            </div>
          </div>
        </div>

        <div className="reviews-scroll" role="list"
          aria-label={lang === "th" ? "รีวิวจากลูกค้า" : "Customer reviews"}
          style={{ display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory",
            paddingBottom: 14, marginInline: "-24px", paddingInline: 24, WebkitOverflowScrolling: "touch" }}>
          {reviews.map((review, i) => <ReviewCard key={i} review={review} />)}
        </div>
        <p style={{ textAlign: "center", marginTop: 4, fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "var(--fg-4)" }}>
          {t.scrollHint}
        </p>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <a href="https://www.google.com/maps/search/?api=1&query=SUP+Space+Maeklong"
            target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: 14 }}>
            {t.mapsLink}
          </a>
        </div>
      </div>

      <style>{`
        .review-card:hover { box-shadow: var(--shadow-md) !important; }
        .reviews-scroll { scrollbar-width: thin; scrollbar-color: var(--teal-200) transparent; }
        .reviews-scroll::-webkit-scrollbar { height: 8px; }
        .reviews-scroll::-webkit-scrollbar-thumb { background: var(--teal-200); border-radius: 999px; }
        .reviews-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </section>
  );
}
