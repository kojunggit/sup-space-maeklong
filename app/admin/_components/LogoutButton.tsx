"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 8, padding: "8px 16px", fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 160ms" }}
    >
      ออกจากระบบ
    </button>
  );
}
