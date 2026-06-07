import { getGalleryPhotos } from "@/app/actions/gallery";
import GalleryManager from "../../_components/GalleryManager";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-kanit)", fontSize: 22, fontWeight: 700, color: "var(--fg-1)", margin: 0 }}>
          จัดการแกลเลอรี
        </h1>
        <p style={{ fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-3)", marginTop: 4 }}>
          รูปทั้งหมด {photos.length} รูป · อัปโหลดรูปใหม่หรือแก้ไขคำบรรยายด้านล่าง
        </p>
      </div>
      <GalleryManager initialPhotos={photos} />
    </div>
  );
}
