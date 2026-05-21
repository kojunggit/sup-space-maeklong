"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res  = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(data.error ?? "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--sand-50)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-kanit)", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: 380, border: "1px solid var(--border-1)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--teal-50)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 12 }}>🏄</div>
          <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 22, color: "var(--fg-1)" }}>Admin Login</div>
          <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 4, fontWeight: 300 }}>Sup Space Maeklong</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)" }}>รหัสผ่าน Admin</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
              style={{ fontFamily: "var(--font-kanit)", fontSize: 15, padding: "12px 14px", borderRadius: 10, border: "1.5px solid var(--border-2)", background: "#fff", color: "var(--fg-1)", outline: "none", width: "100%" }}
            />
          </label>

          {error && (
            <div style={{ padding: "10px 14px", background: "#FFF1F0", borderRadius: 8, fontSize: 13, color: "#cf1322", fontWeight: 500 }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "13px 0", background: "var(--sup-teal)", color: "#fff", border: "none", borderRadius: 10, fontFamily: "var(--font-kanit)", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, width: "100%", transition: "opacity 160ms" }}
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "var(--fg-4)", lineHeight: 1.6 }}>
          ตั้งรหัสผ่านใน Vercel Environment Variable<br />
          <code style={{ background: "var(--sand-100)", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}
