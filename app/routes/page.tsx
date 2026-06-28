import RoutesClient from "./RoutesClient";
import { getRoutes } from "@/app/actions/routes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "เส้นทางพาย | SUP Space Maeklong",
  description: "เส้นทางพายซับบอร์ดริมแม่กลองทั้งหมด ทั้งระยะใกล้ กลาง และไกล พร้อมรายละเอียดและราคา · SUP Maeklong paddling routes in Samut Songkhram (short, medium & long) with details and pricing.",
};

export default async function RoutesPage() {
  const routes = await getRoutes();
  return <RoutesClient routes={routes} />;
}
