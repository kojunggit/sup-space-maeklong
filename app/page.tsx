import HomeClient from "./_components/HomeClient";
import { getUpcomingTrips } from "./actions/booking";
import { getPlaceData } from "./lib/google-places";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trips, placeData] = await Promise.all([
    getUpcomingTrips(),
    getPlaceData(),
  ]);
  return <HomeClient initialTrips={trips} placeData={placeData} />;
}
