"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { GalleryPhoto } from "@/app/actions/gallery";
import { GALLERY_CATEGORIES } from "@/app/lib/gallery-constants";

const ALL = "__all__";

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
        position: "relative", borderRadius: 14, overflow: "hidden",
        cursor: "pointer",
        boxShadow: hover ? "0 12px 40px rgba(0,0,0,0.22)" : "0 2px 12px rgba(0,0,0,0.1)",
        transition: "box-shadow 240ms ease, transform 240ms ease",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <Image
        src={src}
        alt={caption}
        fill
        sizes={big ? "(max-width: 760px) 100vw, 50vw" : "(max-width: 760px) 50vw, 25vw"}
        style={{ objectFit: "cover", transition: "transform 400ms ease" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(0,0,0,0.72) 100%)",
        opacity: hover ? 1 : 0.55,
        transition: "opacity 240ms ease",
      }} />
      <div
        className="cell-cap"
        style={{
          position: "absolute", bottom: 14, left: 16, right: 16,
          color: "#fff", fontFamily: "var(--font-kanit)", fontWeight: 500,
          fontSize: big ? 20 : 15,
          textShadow: "0 2px 10px rgba(0,0,0,0.7)",
          transform: hover ? "translateY(0)" : "translateY(5px)",
          opacity: hover ? 1 : 0.82,
          transition: "all 240ms ease",
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
        background: "rgba(0,0,0,0.94)",
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
        <Image src={shot.src} alt={shot.caption} fill priority sizes="(max-width: 760px) 90vw, 1100px" style={{ objectFit: "contain" }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "20px 24px 16px",
          background: "linear-gradient(0deg,rgba(0,0,0,0.7) 0%,transparent 100%)",
          color: "#fff", fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 22,
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}>{shot.caption}</div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={!hasPrev} style={{ position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: "50%", border: "none", background: hasPrev ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)", color: "#fff", fontSize: 30, cursor: hasPrev ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} disabled={!hasNext} style={{ position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: "50%", border: "none", background: hasNext ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)", color: "#fff", fontSize: 30, cursor: hasNext ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
      <button onClick={onClose} style={{ position: "fixed", top: 16, right: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-kanit)", fontSize: 14, pointerEvents: "none" }}>{index + 1} / {shots.length}</div>
    </div>
  );
}

function TabPill({
  id, label, icon, count, active, onClick,
}: {
  id: string; label: string; icon: string; count: number; active: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "9px 18px", borderRadius: 999, whiteSpace: "nowrap",
        border: active ? "2px solid var(--sup-teal)" : "2px solid #e5e7eb",
        background: active ? "var(--sup-teal)" : "#fff",
        color: active ? "#fff" : "var(--fg-2)",
        fontFamily: "var(--font-kanit)", fontSize: 14, fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 180ms ease",
        boxShadow: active ? "0 2px 12px rgba(6,79,59,0.25)" : "none",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      {label}
      <span style={{
        padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600,
        background: active ? "rgba(255,255,255,0.22)" : "#f3f4f6",
        color: active ? "#fff" : "var(--fg-3)",
      }}>{count}</span>
    </button>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "80px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>📷</div>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 18, fontWeight: 600, color: "var(--fg-2)" }}>ยังไม่มีภาพในกลุ่มนี้</div>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 14, marginTop: 8, color: "var(--fg-4)" }}>ติดตามเร็ว ๆ นี้</div>
    </div>
  );
}

export default function GalleryPageClient({ photos }: { photos: GalleryPhoto[] }) {
  const [activeCat, setActiveCat] = useState<string>(ALL);
  const [filterKey, setFilterKey] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = activeCat === ALL ? photos : photos.filter((p) => p.category === activeCat);

  const counts: Record<string, number> = {
    [ALL]: photos.length,
    ...Object.fromEntries(
      GALLERY_CATEGORIES.map((c) => [c.id, photos.filter((p) => p.category === c.id).length]),
    ),
  };

  function handleCatChange(id: string) {
    if (id === activeCat) return;
    setActiveCat(id);
    setFilterKey((k) => k + 1);
    setLightboxIdx(null);
  }

  const close = useCallback(() => setLightboxIdx(null), []);
  const prev  = useCallback(() => setLightboxIdx((i) => (i !== null && i > 0) ? i - 1 : i), []);
  const next  = useCallback(() => setLightboxIdx((i) => (i !== null && i < filtered.length - 1) ? i + 1 : i), [filtered.length]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Sticky header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-1)",
        height: 60, padding: "0 24px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-3)",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
            flexShrink: 0,
          }}
        >
          ← หน้าหลัก
        </Link>
        <div style={{ width: 1, height: 20, background: "var(--border-1)", flexShrink: 0 }} />
        <h1 style={{
          fontFamily: "var(--font-kanit)", fontSize: 17, fontWeight: 700,
          color: "var(--fg-1)", margin: 0, flexShrink: 0,
        }}>
          ภาพประทับใจ
        </h1>
        <span style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-4)", fontWeight: 300 }}>
          {photos.length} ภาพ
        </span>
        <div style={{ flex: 1 }} />
        <Link href="/#book" className="btn btn-primary" style={{ fontSize: 13, padding: "7px 18px", flexShrink: 0 }}>
          จองทริป →
        </Link>
      </header>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)",
        padding: "52px 0 96px",
      }}>
        <div className="container">
          <p style={{
            fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 400,
            color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em",
            textTransform: "uppercase", margin: "0 0 12px",
          }}>
            ความทรงจำจากลำน้ำ · SUP Space Maeklong
          </p>
          <h2 style={{
            fontFamily: "var(--font-kanit)", fontWeight: 800,
            fontSize: "clamp(34px, 5vw, 60px)",
            color: "#fff", margin: 0, lineHeight: 1.1,
          }}>
            ภาพประทับใจ
          </h2>
          <p style={{
            fontFamily: "var(--font-kanit)", fontSize: 16, fontWeight: 300,
            color: "rgba(255,255,255,0.65)", marginTop: 14,
          }}>
            ถ่ายโดยทีมงานทุกภาพ — ไม่มีการจัดท่า
          </p>
        </div>
      </div>

      {/* Floating category card */}
      <div style={{ position: "relative", marginTop: -52 }}>
        <div className="container">
          <div style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 8px 48px rgba(0,0,0,0.14)",
            padding: "20px 24px",
          }}>
            <div style={{
              display: "flex", gap: 10, overflowX: "auto",
              paddingBottom: 2,
              msOverflowStyle: "none",
              scrollbarWidth: "none" as const,
            }} className="cat-scroll">
              <TabPill
                id={ALL}
                label="ทั้งหมด"
                icon="🌊"
                count={counts[ALL]}
                active={activeCat === ALL}
                onClick={handleCatChange}
              />
              {GALLERY_CATEGORIES.map((cat) => (
                <TabPill
                  key={cat.id}
                  id={cat.id}
                  label={cat.label}
                  icon={cat.icon}
                  count={counts[cat.id]}
                  active={activeCat === cat.id}
                  onClick={handleCatChange}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo grid */}
      <div className="container" style={{ paddingTop: 36, paddingBottom: 64 }}>
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            key={filterKey}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gridAutoRows: "240px",
              gridAutoFlow: "dense",
              gap: 14,
              animation: "galleryFadeIn 280ms ease",
            }}
            className="gallery-full-grid"
          >
            {filtered.map((p, i) => (
              <Cell
                key={p.id}
                src={p.src}
                caption={p.caption}
                big={p.big}
                onClick={() => setLightboxIdx(i)}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Link href="/#book" className="btn btn-primary" style={{ fontSize: 16, padding: "14px 40px" }}>
            จองทริป →
          </Link>
        </div>
      </div>

      {lightboxIdx !== null && (
        <Lightbox shots={filtered} index={lightboxIdx} onClose={close} onPrev={prev} onNext={next} />
      )}

      <style>{`
        @keyframes galleryFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
        @media (max-width: 900px) {
          .gallery-full-grid {
            grid-template-columns: repeat(3,1fr) !important;
            grid-auto-rows: 200px !important;
          }
        }
        @media (max-width: 600px) {
          .gallery-full-grid {
            grid-template-columns: 1fr 1fr !important;
            grid-auto-rows: 180px !important;
          }
          .cell-cap {
            transform: translateY(0) !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
