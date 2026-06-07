import HomeClient from "./_components/HomeClient";
import { getUpcomingTrips } from "./actions/booking";
import { getPlaceData } from "./lib/google-places";
import { getLatestGalleryPhotos } from "./actions/gallery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trips, placeData, gallery] = await Promise.all([
    getUpcomingTrips(),
    getPlaceData(),
    getLatestGalleryPhotos(10),
  ]);
  return <HomeClient initialTrips={trips} placeData={placeData} initialGallery={gallery} />;
}
