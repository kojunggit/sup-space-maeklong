import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  onBookClick: () => void;
}

const TRUST_POINTS = ["มือใหม่พายได้", "ใกล้กรุงเทพฯ", "มีผู้สอนดูแลตลอดทริป"];

const AVATARS = [
  { initials: "ก", bg: "#008080" },
  { initials: "ต", bg: "#FF8C00" },
  { initials: "พ", bg: "#006B6B" },
  { initials: "S", bg: "#B85F00" },
];

export default function Hero({ onBookClick }: HeroProps) {
  return (
    <section id="home" className="hero">
      {/* Optimized LCP background via next/image (alt carries English SEO keywords) */}
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
            แม่กลอง · สมุทรสงคราม
          </p>

          <h1 className="hero__title">
            พาย <span className="hero__title-accent">SUP</span> เที่ยวตลาดน้ำและวิถีชีวิตริมคลองแม่กลอง
          </h1>

          {/* Behind-the-scenes English keywords for SEO / screen readers */}
          <p className="sr-only">
            SUP Maeklong — Stand Up Paddle Board Thailand tours through Tha Kha and Bang Noi
            floating markets in Samut Songkhram. A beginner-friendly Thailand local experience and
            one of the best things to do near Bangkok.
          </p>

          <p className="hero__subtitle">
            สัมผัสเสน่ห์ของสมุทรสงครามจากมุมมองที่ไม่เหมือนใคร ผ่านตลาดน้ำ สวนมะพร้าว
            และชุมชนเก่าแก่ริมคลอง
          </p>

          <ul className="hero__trust" aria-label="จุดเด่นของทริป">
            {TRUST_POINTS.map((t) => (
              <li key={t} className="hero__trust-item">
                <span className="hero__trust-check" aria-hidden="true">✓</span>
                {t}
              </li>
            ))}
          </ul>

          <div className="hero__cta">
            <button onClick={onBookClick} className="btn btn-primary hero__cta-primary">
              จองทริป
            </button>
            <Link href="/routes" className="btn hero__cta-secondary">
              ดูเส้นทางพาย
            </Link>
          </div>

          {/* Social proof: avatars + rating + visitor count */}
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
                <strong>4.9</strong>
                <span className="hero__proof-muted">จาก 312 รีวิว Google</span>
              </span>
              <span className="hero__proof-muted">นักพายกว่า 1,200 คน ร่วมทริปกับเรา</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
