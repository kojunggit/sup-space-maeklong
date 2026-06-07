import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/auth";
import { VALID_CATEGORY_IDS } from "@/app/lib/gallery-constants";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const caption = ((formData.get("caption") as string | null) ?? "").trim();
  const big = formData.get("big") === "true";
  const categoryRaw = formData.get("category") as string | null;
  const category = categoryRaw && VALID_CATEGORY_IDS.has(categoryRaw) ? categoryRaw : null;

  if (!file) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "รองรับเฉพาะ JPEG, PNG, WebP" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 10MB" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;

  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()));

  const agg = await prisma.galleryPhoto.aggregate({ _max: { order: true } });
  const order = (agg._max.order ?? -1) + 1;

  const photo = await prisma.galleryPhoto.create({
    data: { src: `/uploads/${filename}`, caption: caption || filename, big, category, order },
  });

  return NextResponse.json({ ok: true, photo });
}
