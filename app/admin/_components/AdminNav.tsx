"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/admin/dashboard",      label: "Dashboard",    icon: "📊" },
  { href: "/admin/bookings",       label: "การจอง",       icon: "📋" },
  { href: "/admin/special-trips",  label: "ทริปพิเศษ",    icon: "✨" },
  { href: "/admin/members",        label: "สมาชิก",       icon: "👥" },
  { href: "/admin/gallery",        label: "แกลเลอรี",     icon: "🖼️" },
  { href: "/admin/settings",       label: "ตั้งค่า",       icon: "⚙️" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid var(--border-1)",
      padding: "0 24px",
      display: "flex",
      gap: 2,
    }}>
      {MENU.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "13px 18px",
              fontFamily: "var(--font-kanit)",
              fontSize: 14,
              fontWeight: active ? 700 : 400,
              color: active ? "var(--sup-teal)" : "var(--fg-2)",
              borderBottom: `2.5px solid ${active ? "var(--sup-teal)" : "transparent"}`,
              textDecoration: "none",
              transition: "color 140ms, border-color 140ms",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
