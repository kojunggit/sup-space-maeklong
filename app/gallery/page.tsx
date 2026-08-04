import { getGalleryPhotos } from "@/app/actions/gallery";
import { getCampaignStats } from "@/app/actions/campaign";
import GalleryPageClient from "./GalleryPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ภาพประทับใจ | SUP Space Maeklong",
  description: "ภาพความทรงจำจากทริปพาย SUP ริมคลองแม่กลอง ถ่ายโดยทีมงาน SUP Space Maeklong",
};

export default async function GalleryPage() {
  const [photos, campaignStats] = await Promise.all([getGalleryPhotos(), getCampaignStats()]);
  return <GalleryPageClient photos={photos} campaignStats={campaignStats} />;
}
