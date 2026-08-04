"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/gogreen", label: "แดชบอร์ด" },
  { href: "/gogreen/register", label: "ลงทะเบียน" },
  { href: "/gogreen/list", label: "รายชื่อ" },
  { href: "/gogreen/trash", label: "น้ำหนักขยะ" },
  { href: "/gogreen/report", label: "รายงาน" },
];

export default function GoGreenNav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-[#e1e0d9] bg-white print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <span className="text-lg font-medium text-[#008300]">🌱 GoGreen</span>
        <nav className="flex flex-wrap justify-end gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-[#008300] text-white"
                    : "text-[#52514e] hover:bg-[#f0efec]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
