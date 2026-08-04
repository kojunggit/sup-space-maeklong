import { listMembers } from "@/app/actions/members";
import MembersManager from "../../_components/MembersManager";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await listMembers();

  return (
    <div className="px-4 py-5 md:px-6 md:py-7 max-w-[760px]">
      <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 20, fontWeight: 700, color: "var(--fg-1)", margin: "0 0 6px" }}>
        สมาชิก / แพคเกจ
      </h2>
      <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "var(--fg-3)", margin: "0 0 24px" }}>
        จัดการสมาชิกแพคเกจ ฿2,900 (10 ครั้ง) และ ฿3,500 (รายเดือน) · ใช้เบอร์โทรเป็นรหัสสมาชิก · บันทึกการมาผ่าน Telegram หรือที่นี่
      </p>
      <MembersManager initialMembers={members} />
    </div>
  );
}
