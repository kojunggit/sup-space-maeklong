import HomeClient from "./_components/HomeClient";
import { getUpcomingTrips } from "./actions/booking";

export default async function HomePage() {
  const trips = await getUpcomingTrips();
  return <HomeClient initialTrips={trips} />;
}
