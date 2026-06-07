"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "./lang-context";
import { T } from "./translations";
import type { GalleryPhoto } from "@/app/actions/gallery";

function Cell({
  src, caption, big, onClick,
}: {
  src: string; caption: string; big?: boolean; onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        gridColumn: big ? "span 2" : "span 1",
        gridRow:    big ? "span 2" : "span 1",
        position: "relative", borderRadius: 12, overflow: "hidden",
        cursor: "pointer",
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-md)",
        transition: "box-shadow 240ms var(--ease-out)",
      }}
    >
      <Image
        src={src}
        alt={caption}
        fill
        sizes={big
          ? "(max-width: 760px) 100vw, 50vw"
          : "(max-width: 760px) 50vw, 25vw"}
        style={{ objectFit: "cover" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg,rgba(26,32,44,0) 30%,rgba(26,32,44,0.78) 100%)",
        opacity: hover ? 1 : 0.6,
        transition: "opacity 240ms var(--ease-out)",
      }} />
      <div
        className="cell-cap"
        style={{
          position: "absolute", bottom: 14, left: 16, right: 16,
          color: "#fff", fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 20,
          textShadow: "0 2px 12px rgba(0,0,0,0.6)",
          transform: hover ? "translateY(0)" : "translateY(6px)",
          opacity: hover ? 1 : 0.85,
          transition: "all 240ms var(--ease-out)",
        }}
      >{caption}</div>
    </div>
  );
}

function Lightbox({
  shots, index, onClose, onPrev, onNext,
}: {
  shots: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const shot = shots[index];
  const hasPrev = index > 0;
  const hasNext = index < shots.length - 1;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(90vw, 1100px)",
          height: "min(82vh, 760px)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Image
          src={shot.src}
          alt={shot.caption}
          fill
          priority
          sizes="(max-width: 760px) 90vw, 1100px"
          style={{ objectFit: "contain" }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "20px 24px 16px",
          background: "linear-gradient(0deg,rgba(0,0,0,0.65) 0%,transparent 100%)",
          color: "#fff", fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 22,
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}>
          {shot.caption}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        disabled={!hasPrev}
        style={{
          position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)",
          width: 48, height: 48, borderRadius: "50%", border: "none",
          background: hasPrev ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
          color: "#fff", fontSize: 28, cursor: hasPrev ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 180ms",
        }}
      >‹</button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        disabled={!hasNext}
        style={{
          position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
          width: 48, height: 48, borderRadius: "50%", border: "none",
          background: hasNext ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
          color: "#fff", fontSize: 28, cursor: hasNext ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 180ms",
        }}
      >›</button>

      <button
        onClick={onClose}
        style={{
          position: "fixed", top: 16, right: 16,
          width: 40, height: 40, borderRadius: "50%", border: "none",
          background: "rgba(255,255,255,0.18)",
          color: "#fff", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >✕</button>

      <div style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
        color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-kanit)", fontSize: 14,
        pointerEvents: "none",
      }}>
        {index + 1} / {shots.length}
      </div>
    </div>
  );
}

export default function Gallery({ shots }: { shots: GalleryPhoto[] }) {
  const { lang } = useLang();
  const t = T[lang].gallery;
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIdx(null), []);
  const prev  = useCallback(() => setLightboxIdx(i => (i !== null && i > 0) ? i - 1 : i), []);
  const next  = useCallback(() => setLightboxIdx(i => (i !== null && i < shots.length - 1) ? i + 1 : i), [shots.length]);

  return (
    <section id="gallery" style={{ background: "var(--bg-page)" }} className="section-pad">
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h2 className="section-title">{t.title.pre}<span className="accent">{t.title.accent}</span>{t.title.post}</h2>
            <p className="section-sub">{t.sub}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/gallery" className="btn btn-primary">ภาพประทับใจ →</Link>
            <a href="#book" className="btn btn-secondary">{t.cta}</a>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gridAutoRows: "200px",
            gridAutoFlow: "dense",
            gap: 14,
          }}
          className="gallery-grid"
        >
          {shots.map((s, i) => (
            <Cell key={s.id} src={s.src} caption={s.caption} big={s.big} onClick={() => setLightboxIdx(i)} />
          ))}
        </div>
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          shots={shots}
          index={lightboxIdx}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}

      <style>{`
        @media (max-width: 760px) {
          .gallery-grid {
            grid-template-columns: 1fr 1fr !important;
            grid-auto-rows: 180px !important;
          }
          /* caption always visible on touch devices */
          .cell-cap {
            transform: translateY(0) !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
