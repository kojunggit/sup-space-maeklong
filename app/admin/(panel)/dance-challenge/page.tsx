import { getDanceChallengeEntries } from "@/app/actions/dance-challenge";
import { formatPhone } from "@/app/lib/phone";

export const dynamic = "force-dynamic";

export default async function DanceChallengeAdminPage() {
  const entries = await getDanceChallengeEntries();
  const grantedCount = entries.filter((e) => e.slotGranted).length;

  return (
    <div className="px-4 py-5 md:px-6 md:py-7 max-w-[760px]">
      <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 20, fontWeight: 700, color: "var(--fg-1)", margin: "0 0 6px" }}>
        ผู้ร่วมกิจกรรม Dance Challenge
      </h2>
      <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "var(--fg-3)", margin: "0 0 24px" }}>
        {entries.length} รายการ · ได้สิทธิ์พายฟรีแล้ว {grantedCount}/30 คน · ตรวจสอบคลิปตามกติกาแล้วยืนยันสิทธิ์กลับทาง LINE OA
      </p>

      {entries.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 12, padding: "40px 20px",
          border: "1px solid var(--border-1)", textAlign: "center",
          fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 14, color: "var(--fg-3)",
        }}>
          ยังไม่มีผู้ร่วมกิจกรรม
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {entries.map((entry) => {
            const createdStr = new Date(entry.createdAt).toLocaleString("th-TH", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            });
            return (
              <div key={entry.id} style={{
                background: "#fff", borderRadius: 12, padding: "16px 18px",
                border: "1px solid var(--border-1)",
                display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px",
              }}>
                <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 15, color: "var(--fg-1)" }}>
                  {entry.name}
                </div>
                {entry.slotGranted ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: "var(--campaign-accent-soft)", color: "var(--campaign-accent)",
                    fontFamily: "var(--font-inter)",
                  }}>
                    🎟️ ได้สิทธิ์พายฟรี · สร้างสมาชิกแล้ว
                  </span>
                ) : (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                    background: "var(--sand-100)", color: "var(--fg-3)",
                    fontFamily: "var(--font-inter)",
                  }}>
                    ↩️ ไม่ได้สิทธิ์ทริปฟรี
                  </span>
                )}
                <a
                  href={`tel:${entry.phone}`}
                  style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--sup-teal)", textDecoration: "none" }}
                >
                  📞 {formatPhone(entry.phone)}
                </a>
                <a
                  href={entry.clipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--campaign-accent)",
                    textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", maxWidth: 320,
                  }}
                >
                  🔗 {entry.clipUrl}
                </a>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--fg-4)", whiteSpace: "nowrap" }}>
                  {createdStr}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
