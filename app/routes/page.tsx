import RoutesClient from "./RoutesClient";
import { getRoutes } from "@/app/actions/routes";
import { getCampaignStats } from "@/app/actions/campaign";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "เส้นทางพาย | SUP Space Maeklong",
  description: "เส้นทางพายซับบอร์ดริมแม่กลองทั้งหมด ทั้งระยะใกล้ กลาง และไกล พร้อมรายละเอียดและราคา · SUP Maeklong paddling routes in Samut Songkhram (short, medium & long) with details and pricing.",
};

export default async function RoutesPage() {
  const [routes, campaignStats] = await Promise.all([getRoutes(), getCampaignStats()]);
  return <RoutesClient routes={routes} campaignStats={campaignStats} />;
}
