import { getRoutes } from "@/app/actions/routes";
import RoutesManager from "@/app/admin/_components/RoutesManager";

export const dynamic = "force-dynamic";

export default async function AdminRoutesPage() {
  const routes = await getRoutes();
  return <RoutesManager initialRoutes={routes} />;
}
