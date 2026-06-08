import { getGalleryPhotos } from "@/app/actions/gallery";
import GalleryPageClient from "./GalleryPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ภาพประทับใจ | SUP Space Maeklong",
  description: "ภาพความทรงจำจากทริปพาย SUP ริมคลองแม่กลอง ถ่ายโดยทีมงาน SUP Space Maeklong",
};

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();
  return <GalleryPageClient photos={photos} />;
}
