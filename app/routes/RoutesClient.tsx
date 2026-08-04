"use client";

import Image from "next/image";
import { CATEGORIES } from "@/app/_components/trips-data";
import Footer from "@/app/_components/Footer";
import CampaignBar from "@/app/_components/CampaignBar";
import { useCampaignBarVisible } from "@/app/_components/useCampaignBar";
import { CAMPAIGN_BAR_HEIGHT } from "@/app/_components/campaign-config";
import { LangProvider, useLang } from "@/app/_components/lang-context";
import { T } from "@/app/_components/translations";
import type { DBRoute } from "@/app/actions/routes";
import type { CampaignStats } from "@/app/actions/campaign";

// Category accent colors
const CAT_ACCENT: Record<string, string> = {
  short:  "var(--sup-teal)",
  medium: "var(--sup-orange)",
  long:   "var(--sup-dark)",
};
const CAT_BG: Record<string, string> = {
  short:  "var(--teal-50)",
  medium: "#FFF4E5",
  long:   "#F0F2F5",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

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

function StatChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 999,
      background: "var(--sand-50)", border: "1px solid var(--border-1)",
      fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, color: "var(--fg-2)",
      whiteSpace: "nowrap",
    }}>
      {icon} {label}
    </span>
  );
}

// ─── Route photo lightbox ─────────────────────────────────────────────────────

function PhotoStrip({ photos, routeName }: { photos: DBRoute["photos"]; routeName: string }) {
  if (photos.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", margin: "12px -22px", padding: "0 22px", scrollbarWidth: "none" }}>
      {photos.map((p) => (
        <div key={p.id} style={{ position: "relative", width: 120, height: 88, flexShrink: 0, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-1)" }}>
          <Image src={p.src} alt={p.caption || routeName} fill style={{ objectFit: "cover" }} sizes="120px" />
        </div>
      ))}
      <style>{`.photo-strip::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

function RouteCard({ route }: { route: DBRoute }) {
  const { lang } = useLang();
  const t = T[lang].routesPage;
  const accent = CAT_ACCENT[route.cat];

  const name = lang === "en" ? (route.nameEn || route.name) : route.name;
  const desc = lang === "en"
    ? (route.descEn || route.descTh || route.note)
    : (route.descTh || route.note);
  const warn = lang === "en" ? route.warnEn : route.warnTh;

  return (
    <div
      style={{
        background: "#fff", borderRadius: 14,
        border: "1px solid var(--border-1)",
        boxShadow: "var(--shadow-sm)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 220ms var(--ease-out), transform 220ms var(--ease-out)",
      }}
      className="route-card"
    >
      {/* Cover photo or accent bar */}
      {route.photos[0] ? (
        <div style={{ position: "relative", height: 160, flexShrink: 0 }}>
          <Image
            src={route.photos[0].src}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 100vw, 340px"
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: accent }} />
        </div>
      ) : (
        <div style={{ height: 4, background: accent, flexShrink: 0 }} />
      )}

      <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <h3 style={{
            margin: 0, fontFamily: "var(--font-kanit)", fontSize: 18, fontWeight: 700,
            color: "var(--fg-1)", lineHeight: 1.3,
          }}>
            {name}
          </h3>
          {route.recommend && (
            <span style={{
              flexShrink: 0, background: "var(--sup-orange)", color: "#fff",
              fontFamily: "var(--font-inter)", fontSize: 9, fontWeight: 700,
              padding: "3px 8px", borderRadius: 999, letterSpacing: "0.06em",
              textTransform: "uppercase", marginTop: 3,
            }}>{t.recommend}</span>
          )}
        </div>

        <p style={{
          margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300,
          fontSize: 14, color: "var(--fg-2)", lineHeight: 1.7, flex: 1,
        }}>
          {desc}
        </p>

        {/* Additional photos strip */}
        {route.photos.length > 1 && (
          <PhotoStrip photos={route.photos.slice(1)} routeName={name} />
        )}

        {warn && (
          <div style={{
            padding: "10px 13px", borderRadius: 8,
            background: "#FFFBE6", border: "1px solid #FFE58F",
            fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 400,
            color: "#7C5600", lineHeight: 1.55,
          }}>
            {warn}
          </div>
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <StatChip icon="📍" label={`${route.km} ${t.km}`} />
          <StatChip icon="⏱" label={`${route.duration} ${t.hours}`} />
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 12, borderTop: "1px dashed var(--border-1)", gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 22, color: accent, lineHeight: 1 }}>
              ฿{route.price.toLocaleString()}
            </div>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>
              {t.perBoard}
            </div>
          </div>
          <a href="/#book" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 16px", borderRadius: 9,
            background: accent, color: "#fff",
            fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 150ms",
          }}
            className="book-btn"
          >
            {t.bookThis}
          </a>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ cat, routes }: { cat: string; routes: DBRoute[] }) {
  const { lang } = useLang();
  const t = T[lang].routesPage;
  const accent = CAT_ACCENT[cat];
  const bg     = CAT_BG[cat];
  const label  = t.catLabels[cat];
  const sub    = t.catSubs[cat];
  const skill  = t.catSkills[cat];

  return (
    <section style={{ marginBottom: 64 }}>
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        gap: 20, marginBottom: 28, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: bg, border: `2px solid ${accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: "var(--font-kanit)", fontSize: 15, fontWeight: 700, color: accent }}>
              {label}
            </span>
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase", color: accent, marginBottom: 3,
            }}>
              {t.catEyebrowPrefix}{label}{t.catEyebrowSuffix}
            </div>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-2)", fontWeight: 300 }}>
              {sub} · {skill}
            </div>
          </div>
        </div>
        <div style={{
          padding: "8px 16px", borderRadius: 999,
          background: bg, border: `1px solid ${accent}`,
          fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
          color: accent, whiteSpace: "nowrap",
        }}>
          {t.routeCount(routes.length)}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 18,
      }}>
        {routes.map((r) => <RouteCard key={r.id} route={r} />)}
      </div>
    </section>
  );
}

// ─── Page body ─────────────────────────────────────────────────────────────────

function RoutesBody({ routes, campaignStats }: { routes: DBRoute[]; campaignStats: CampaignStats }) {
  const { lang } = useLang();
  const t = T[lang].routesPage;
  const byCategory = (cat: string) => routes.filter((r) => r.cat === cat);
  const totalCount = routes.length;
  const [barVisible] = useCampaignBarVisible();

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <CampaignBar remainingSlots={campaignStats.remainingSlots} />

      {/* ── Minimal nav ─────────────────────────────────────────────────────── */}
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
            <span style={{ fontFamily: "var(--font-kanit)", fontWeight: 500, fontSize: 15, display: "none" }} className="nav-brand">SUP Space Maeklong</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LangToggle />
            <a href="/" style={{ fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-2)", textDecoration: "none", fontWeight: 400, display: "flex", alignItems: "center", gap: 5 }}>
              {t.navHome}
            </a>
            <a href="/#book" className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 14 }}>
              {t.navBook}
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{
        background: "var(--sup-dark)",
        padding: "72px 24px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,128,128,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: "30%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,0,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.22)",
            fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sup-orange)",
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--sup-orange)", display: "inline-block" }} />
            {t.badge}
          </div>

          <h1 style={{
            fontFamily: "var(--font-kanit)", fontWeight: 700,
            fontSize: 52, lineHeight: 1.1, letterSpacing: "-0.02em",
            color: "#fff", margin: "0 0 16px",
          }}>
            {totalCount} {t.titleAccent}
            <br />
            <span style={{ fontWeight: 300, fontSize: 28, color: "rgba(255,255,255,0.78)" }}>
              {t.titleSub}
            </span>
          </h1>

          <p style={{
            fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 17,
            color: "rgba(255,255,255,0.85)", lineHeight: 1.65, maxWidth: 580,
            margin: "0 0 36px",
          }}>
            {t.intro}
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <a key={c.id} href={`#cat-${c.id}`} style={{
                padding: "10px 18px", borderRadius: 999, textDecoration: "none",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.25)",
                fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 500,
                color: "#fff", transition: "background 160ms",
                display: "flex", alignItems: "center", gap: 8,
              }}
                className="cat-jump"
              >
                <span style={{
                  background: CAT_ACCENT[c.id], width: 8, height: 8,
                  borderRadius: 999, display: "inline-block",
                }} />
                {t.catJumpPrefix}{t.catLabels[c.id]} · {t.catSubs[c.id]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Route sections ───────────────────────────────────────────────────── */}
      <main className="container" style={{ padding: "56px 24px" }}>

        {CATEGORIES.map((c) => {
          const catRoutes = byCategory(c.id);
          if (catRoutes.length === 0) return null;
          return (
            <div key={c.id} id={`cat-${c.id}`} style={{ scrollMarginTop: 80 }}>
              <CategorySection cat={c.id} routes={catRoutes} />
            </div>
          );
        })}

        {/* ── Custom trip ──────────────────────────────────────────────────── */}
        <section style={{
          padding: "36px 40px", borderRadius: 16,
          background: "linear-gradient(135deg, var(--teal-50) 0%, #FFF4E5 100%)",
          border: "1px solid var(--border-1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 32, flexWrap: "wrap", marginBottom: 24,
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--sup-teal)", marginBottom: 8,
            }}>
              {t.customEyebrow}
            </div>
            <h2 style={{
              margin: "0 0 10px", fontFamily: "var(--font-kanit)", fontSize: 26,
              fontWeight: 700, color: "var(--fg-1)",
            }}>
              {t.customTitle}
            </h2>
            <p style={{
              margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300,
              fontSize: 15, color: "var(--fg-2)", lineHeight: 1.65, maxWidth: 480,
            }}>
              {t.customDesc}
            </p>
          </div>
          <a href="/#contact" className="btn btn-primary" style={{ padding: "13px 24px", fontSize: 15, whiteSpace: "nowrap" }}>
            {t.customCta}
          </a>
        </section>

        {/* ── Healthy package teaser ────────────────────────────────────────── */}
        <section style={{
          padding: "28px 36px", borderRadius: 14,
          background: "var(--sup-dark)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--sup-orange)", marginBottom: 6,
            }}>
              {t.pkgEyebrow}
            </div>
            <p style={{
              margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 300,
              fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.55,
            }}>
              {t.pkgDesc}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { title: t.pkg1Title, price: "2,900", hint: t.pkg1Hint },
              { title: t.pkg2Title, price: "3,500", hint: t.pkg2Hint, hi: true },
            ].map((p) => (
              <div key={p.title} style={{
                padding: "12px 18px", borderRadius: 10,
                background: p.hi ? "var(--sup-orange)" : "rgba(255,255,255,0.08)",
                border: p.hi ? "none" : "1px solid rgba(255,255,255,0.18)",
                minWidth: 160,
              }}>
                <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, color: "#fff" }}>{p.title}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginTop: 4 }}>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>฿</span>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{p.price}</span>
                </div>
                <div style={{ fontFamily: "var(--font-kanit)", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2, fontWeight: 300 }}>{p.hint}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .route-card:hover {
          box-shadow: var(--shadow-lg) !important;
          transform: translateY(-2px) !important;
        }
        .book-btn:hover { opacity: 0.85; }
        .cat-jump:hover { background: rgba(255,255,255,0.18) !important; }
        @media (max-width: 640px) {
          h1 { font-size: 36px !important; }
          h1 span:last-child { font-size: 20px !important; }
        }
        @media (min-width: 768px) {
          .nav-brand { display: inline !important; }
        }
      `}</style>
    </div>
  );
}

export default function RoutesClient({ routes, campaignStats }: { routes: DBRoute[]; campaignStats: CampaignStats }) {
  return (
    <LangProvider>
      <RoutesBody routes={routes} campaignStats={campaignStats} />
    </LangProvider>
  );
}
