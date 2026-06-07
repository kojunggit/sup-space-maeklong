"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/auth";

export type GalleryPhoto = {
  id: string;
  src: string;
  caption: string;
  category: string | null;
  big: boolean;
  order: number;
};

type SeedEntry = Omit<GalleryPhoto, "id">;

const SEED: SeedEntry[] = [
  { src: "/images/KOSI2067.jpg", caption: "อุโมงป่าจาก",     category: "nature",  big: true,  order: 0  },
  { src: "/images/KOSI4747.jpg", caption: "วัดบางน้อย",       category: "spots",   big: false, order: 1  },
  { src: "/images/KOSI4714.jpg", caption: "น้ำใส",            category: "nature",  big: false, order: 2  },
  { src: "/images/KOSI6162.jpg", caption: "กลุ่มเพื่อน",      category: "friends", big: false, order: 3  },
  { src: "/images/KOSI6383.jpg", caption: "ผจญภัยริมคลอง",    category: "nature",  big: true,  order: 4  },
  { src: "/images/KOSI6260.jpg", caption: "พายยามเช้า",       category: "nature",  big: false, order: 5  },
  { src: "/images/KOSI4884.jpg", caption: "สายน้ำยามบ่าย",    category: "nature",  big: true,  order: 6  },
  { src: "/images/KOSI1064.jpg", caption: "ริมคลองแม่กลอง",   category: "market",  big: false, order: 7  },
  { src: "/images/KOSI3797.jpg", caption: "วิถีชุมชน",        category: "market",  big: false, order: 8  },
  { src: "/images/KOSI4709.jpg", caption: "พายเป็นหมู่คณะ",   category: "friends", big: false, order: 9  },
  { src: "/images/KOSI3997.jpg", caption: "สวนมะพร้าวริมน้ำ", category: "nature",  big: false, order: 10 },
  { src: "/images/KOSI4923.jpg", caption: "ช่วงเวลาสงบ",      category: "spots",   big: true,  order: 11 },
  { src: "/images/KOSI4808.jpg", caption: "ออกผจญภัย",        category: "friends", big: false, order: 12 },
  { src: "/images/KOSI5933.jpg", caption: "ธรรมชาติสองฝั่ง",  category: "nature",  big: false, order: 13 },
  { src: "/images/KOSI5971.jpg", caption: "แสงเช้าริมคลอง",   category: "nature",  big: false, order: 14 },
  { src: "/images/KOSI6689.jpg", caption: "ความทรงจำบนน้ำ",   category: "friends", big: false, order: 15 },
];

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const count = await prisma.galleryPhoto.count();
  if (count === 0) {
    await prisma.galleryPhoto.createMany({ data: SEED });
  }
  return prisma.galleryPhoto.findMany({ orderBy: { order: "asc" } });
}

export async function getLatestGalleryPhotos(limit: number): Promise<GalleryPhoto[]> {
  const count = await prisma.galleryPhoto.count();
  if (count === 0) {
    await prisma.galleryPhoto.createMany({ data: SEED });
  }
  return prisma.galleryPhoto.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function updateGalleryPhoto(
  id: string,
  data: { caption?: string; big?: boolean; category?: string | null },
) {
  await assertAdmin();
  await prisma.galleryPhoto.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function moveGalleryPhoto(id: string, direction: "up" | "down") {
  await assertAdmin();

  const photos = await prisma.galleryPhoto.findMany({ orderBy: { order: "asc" } });
  const idx = photos.findIndex((p) => p.id === id);
  if (idx < 0) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= photos.length) return;

  const a = photos[idx];
  const b = photos[swapIdx];

  await prisma.$transaction([
    prisma.galleryPhoto.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.galleryPhoto.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryPhoto(id: string) {
  await assertAdmin();

  const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!photo) return;

  if (photo.src.startsWith("/uploads/")) {
    await unlink(join(process.cwd(), "public", photo.src)).catch(() => {});
  }

  await prisma.galleryPhoto.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}
