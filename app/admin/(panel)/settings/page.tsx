import { getMaxBoards } from "@/app/actions/settings";
import AdminSettings from "../../_components/AdminSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const maxBoards = await getMaxBoards();

  return (
    <div style={{ padding: "28px 24px", maxWidth: 680 }}>
      <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 20, fontWeight: 700, color: "var(--fg-1)", margin: "0 0 6px" }}>
        ตั้งค่าระบบ
      </h2>
      <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "var(--fg-3)", margin: "0 0 24px" }}>
        ปรับค่าที่ใช้ทั่วทั้งระบบการจอง
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {/* Capacity */}
        <SectionLabel label="ความจุต่อรอบ" />
        <AdminSettings initialMaxBoards={maxBoards} />

        {/* Future settings can be added here */}
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700,
      color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em",
      marginTop: 8,
    }}>
      {label}
    </div>
  );
}
