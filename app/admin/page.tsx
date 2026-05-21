import { getBookings } from "@/app/actions/booking";
import { getMaxBoards } from "@/app/actions/settings";
import BookingsTable from "./_components/BookingsTable";
import AdminSettings from "./_components/AdminSettings";
import LogoutButton from "./_components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [bookings, maxBoards] = await Promise.all([getBookings(), getMaxBoards()]);

  // Stats
  const todayIso   = new Date().toISOString().slice(0, 10);
  const todayCount = bookings.filter((b) => b.createdAt.slice(0, 10) === todayIso).length;
  const pending    = bookings.filter((b) => b.status === "PENDING").length;
  const confirmed  = bookings.filter((b) => b.status === "CONFIRMED").length;
  const revenue    = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((s, b) => s + (b.total ?? 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--sand-50)", fontFamily: "var(--font-kanit)" }}>
      {/* Header */}
      <div style={{ background: "var(--sup-teal)", color: "#fff", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🏄</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>Sup Space Admin</div>
            <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 300 }}>จัดการการจองทั้งหมด</div>
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* Stats */}
      <div style={{ padding: "20px 24px 4px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <StatCard label="วันนี้" value={String(todayCount)} sub="การจองใหม่" color="var(--fg-1)" />
          <StatCard label="รอยืนยัน" value={String(pending)} sub="รายการ" color="#D46B08" />
          <StatCard label="ยืนยันแล้ว" value={String(confirmed)} sub="รายการ" color="#389E0D" />
          <StatCard label="รายได้รวม" value={`฿${revenue.toLocaleString()}`} sub="ยกเว้นยกเลิก" color="var(--sup-teal)" />
        </div>

        {/* Settings */}
        <div style={{ marginTop: 10 }}>
          <AdminSettings initialMaxBoards={maxBoards} />
        </div>
      </div>

      {/* Bookings list */}
      <BookingsTable bookings={bookings} />
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-1)" }}>
      <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-inter)", fontSize: 26, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
