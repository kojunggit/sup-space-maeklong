"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface HeaderProps {
  onBookClick: () => void;
}

export default function Header({ onBookClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkColor = scrolled ? "var(--fg-1)" : "#fff";

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "background 220ms var(--ease-out), backdrop-filter 220ms var(--ease-out), box-shadow 220ms var(--ease-out)",
        background: scrolled ? "rgba(251,250,241,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px) saturate(140%)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(26,32,44,0.06)" : "none",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}
      >
        <a href="#home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image
            src="/logo-mark.png"
            alt="SUP Space Maeklong"
            width={56}
            height={56}
            style={{
              height: 56, width: "auto",
              filter: scrolled ? "none" : "drop-shadow(0 2px 10px rgba(0,0,0,0.3))",
            }}
          />
        </a>

        <nav style={{ display: "flex", gap: 28, alignItems: "center" }} aria-label="Primary">
          {[
            { href: "#services", label: "บริการ" },
            { href: "#trips",    label: "ทริป" },
            { href: "#about",    label: "เกี่ยวกับเรา" },
            { href: "#gallery",  label: "ภาพถ่าย" },
            { href: "#contact",  label: "ติดต่อ" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: linkColor, textDecoration: "none", fontWeight: 500, fontSize: 15,
                padding: "8px 4px",
                transition: "color var(--dur-fast) var(--ease-out)",
              }}
            >
              {link.label}
            </a>
          ))}

          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px",
              border: `1px solid ${scrolled ? "var(--border-2)" : "rgba(255,255,255,0.5)"}`,
              color: linkColor, borderRadius: 999,
              fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            TH · EN
          </span>

          <button onClick={onBookClick} className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}>
            จองเลย
          </button>
        </nav>
      </div>
    </header>
  );
}
