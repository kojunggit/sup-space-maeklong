import { getSpecialTrips } from "@/app/actions/special-trips";
import SpecialTripManager from "../../_components/SpecialTripManager";

export const dynamic = "force-dynamic";

export default async function SpecialTripsPage() {
  const trips = await getSpecialTrips();

  return (
    <div className="px-4 py-5 md:px-6 md:py-7 max-w-[720px]">
      <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 20, fontWeight: 700, color: "var(--fg-1)", margin: "0 0 6px" }}>
        ทริปพิเศษ
      </h2>
      <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "var(--fg-3)", margin: "0 0 24px" }}>
        สร้างทริปแบบกำหนดเองที่ไม่ใช่เส้นทางมาตรฐาน จะแสดงบนหน้าแรกพร้อม badge สีม่วง
      </p>
      <SpecialTripManager initialTrips={trips} />
    </div>
  );
}
