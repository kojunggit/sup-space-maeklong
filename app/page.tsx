import HomeClient from "./_components/HomeClient";
import { getUpcomingTrips } from "./actions/booking";
import { getPlaceData } from "./lib/google-places";
import { getLatestGalleryPhotos } from "./actions/gallery";
import { getRoutes } from "./actions/routes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trips, placeData, gallery, routes] = await Promise.all([
    getUpcomingTrips(),
    getPlaceData(),
    getLatestGalleryPhotos(10),
    getRoutes(),
  ]);
  return <HomeClient initialTrips={trips} placeData={placeData} initialGallery={gallery} initialRoutes={routes} />;
}
