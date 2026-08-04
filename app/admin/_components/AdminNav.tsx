"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ClipboardList, Sparkles, Map as MapIcon,
  Users, Images, Settings, MoreHorizontal, X, Music2,
} from "lucide-react";

const MENU = [
  { href: "/admin/dashboard",      label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/bookings",       label: "การจอง",     icon: ClipboardList },
  { href: "/admin/special-trips",  label: "ทริปพิเศษ",  icon: Sparkles },
  { href: "/admin/routes",         label: "เส้นทาง",    icon: MapIcon },
  { href: "/admin/members",        label: "สมาชิก",     icon: Users },
  { href: "/admin/gallery",        label: "แกลเลอรี",   icon: Images },
  { href: "/admin/dance-challenge", label: "Dance Challenge", icon: Music2 },
  { href: "/admin/settings",       label: "ตั้งค่า",     icon: Settings },
];

// Mobile bottom nav: first 4 items shown directly, the rest live in the "more" sheet
const PRIMARY = MENU.slice(0, 4);
const EXTRA   = MENU.slice(4);

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the sheet whenever navigation happens
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const extraActive = EXTRA.some((m) => isActive(pathname, m.href));

  return (
    <>
      {/* ── Desktop: top tab bar ─────────────────────────────── */}
      <nav
        className="hidden md:flex bg-white px-6 gap-0.5 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--border-1)" }}
      >
        {MENU.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-[18px] py-[13px] font-kanit text-sm whitespace-nowrap no-underline transition-colors duration-150 ${
                active
                  ? "font-bold text-[var(--sup-teal)]"
                  : "font-normal text-[var(--fg-2)] hover:text-[var(--fg-1)]"
              }`}
              style={{ borderBottom: `2.5px solid ${active ? "var(--sup-teal)" : "transparent"}` }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile: fixed bottom nav ─────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white grid grid-cols-5"
        style={{
          borderTop: "1px solid var(--border-2)",
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -4px 16px rgba(0,80,80,0.08)",
        }}
      >
        {PRIMARY.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[60px] font-kanit text-[10px] no-underline ${
                active ? "font-bold text-[var(--sup-teal)]" : "font-normal text-[var(--fg-3)]"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[60px] font-kanit text-[10px] bg-transparent border-none cursor-pointer ${
            extraActive || moreOpen ? "font-bold text-[var(--sup-teal)]" : "font-normal text-[var(--fg-3)]"
          }`}
        >
          <MoreHorizontal size={22} strokeWidth={extraActive || moreOpen ? 2.5 : 1.8} />
          เพิ่มเติม
        </button>
      </nav>

      {/* ── Mobile: "more" sheet ─────────────────────────────── */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMoreOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 rounded-t-2xl bg-white p-4"
            style={{ bottom: "calc(60px + env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-kanit font-bold text-[15px] text-[var(--fg-1)]">เมนูเพิ่มเติม</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="bg-transparent border-none cursor-pointer text-[var(--fg-4)] p-1"
                aria-label="ปิด"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-1">
              {EXTRA.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 font-kanit text-[15px] no-underline ${
                      active
                        ? "font-bold text-[var(--sup-teal)] bg-[var(--teal-50)]"
                        : "font-normal text-[var(--fg-2)] active:bg-[var(--sand-50)]"
                    }`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
