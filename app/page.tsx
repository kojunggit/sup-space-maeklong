import HomeClient from "./_components/HomeClient";
import { getUpcomingTrips } from "./actions/booking";
import { getPlaceData } from "./lib/google-places";
import { getGalleryPhotos } from "./actions/gallery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trips, placeData, gallery] = await Promise.all([
    getUpcomingTrips(),
    getPlaceData(),
    getGalleryPhotos(),
  ]);
  return <HomeClient initialTrips={trips} placeData={placeData} initialGallery={gallery} />;
}
