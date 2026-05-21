import LogoutButton from "../_components/LogoutButton";
import AdminNav from "../_components/AdminNav";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--sand-50)", fontFamily: "var(--font-kanit)" }}>
      {/* Header */}
      <div style={{
        background: "var(--sup-teal)", color: "#fff",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🏄</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>Sup Space Admin</div>
            <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 300 }}>จัดการการจองทั้งหมด</div>
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* Tab nav */}
      <AdminNav />

      {/* Page content */}
      <div>{children}</div>
    </div>
  );
}
