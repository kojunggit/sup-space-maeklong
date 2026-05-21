import { getBookings } from "@/app/actions/booking";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const bookings = await getBookings();

  const todayIso   = new Date().toISOString().slice(0, 10);
  const todayCount = bookings.filter((b) => b.createdAt.slice(0, 10) === todayIso).length;
  const pending    = bookings.filter((b) => b.status === "PENDING").length;
  const confirmed  = bookings.filter((b) => b.status === "CONFIRMED").length;
  const revenue    = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((s, b) => s + (b.total ?? 0), 0);

  // 5 most recent pending bookings that need attention
  const pendingRecent = bookings
    .filter((b) => b.status === "PENDING")
    .slice(0, 5);

  return (
    <div style={{ padding: "24px" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label="วันนี้"      value={String(todayCount)}            sub="การจองใหม่"    color="var(--fg-1)" />
        <StatCard label="รอยืนยัน"   value={String(pending)}               sub="รายการ"        color="#D46B08" />
        <StatCard label="ยืนยันแล้ว" value={String(confirmed)}             sub="รายการ"        color="#389E0D" />
        <StatCard label="รายได้รวม"  value={`฿${revenue.toLocaleString()}`} sub="ยกเว้นยกเลิก" color="var(--sup-teal)" />
      </div>

      {/* Pending — needs action */}
      {pendingRecent.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 16, fontWeight: 700, color: "var(--fg-1)", margin: 0 }}>
              รอดำเนินการ
              <span style={{ marginLeft: 8, padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: "#FFF7E6", color: "#D46B08" }}>
                {pending}
              </span>
            </h2>
            <Link href="/admin/bookings" style={{ fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--sup-teal)", fontWeight: 500, textDecoration: "none" }}>
              ดูทั้งหมด →
            </Link>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {pendingRecent.map((b) => (
              <div key={b.id} style={{
                background: "#fff", borderRadius: 12, padding: "14px 18px",
                border: "1px solid var(--border-1)", boxShadow: "var(--shadow-sm)",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--fg-1)" }}>
                    {b.guestName || "ไม่ระบุชื่อ"}
                    {b.guestPhone && (
                      <span style={{ fontWeight: 300, fontSize: 13, color: "var(--fg-3)", marginLeft: 10 }}>{b.guestPhone}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 300, marginTop: 3 }}>
                    {b.date} · {b.timeSlot === "MORNING" ? "รอบเช้า" : "รอบบ่าย"} · {b.paddlers} บอร์ด
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 17, color: "var(--sup-teal)" }}>
                    ฿{(b.total ?? 0).toLocaleString()}
                  </div>
                  <Link href="/admin/bookings" style={{ fontSize: 12, color: "var(--fg-4)", textDecoration: "none" }}>
                    จัดการ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--fg-4)", fontFamily: "var(--font-kanit)" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>ไม่มีรายการรอยืนยัน</div>
          <div style={{ fontSize: 13, fontWeight: 300, marginTop: 4 }}>การจองทั้งหมดได้รับการดำเนินการแล้ว</div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "16px 18px",
      boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-1)",
    }}>
      <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-inter)", fontSize: 28, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
