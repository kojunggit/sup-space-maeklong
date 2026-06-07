import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/auth";
import { VALID_CATEGORY_IDS } from "@/app/lib/gallery-constants";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (photo.src.startsWith("/uploads/")) {
    await unlink(join(process.cwd(), "public", photo.src)).catch(() => {});
  }

  await prisma.galleryPhoto.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as { caption?: string; big?: boolean; category?: string | null };

  const updateData: { caption?: string; big?: boolean; category?: string | null } = {};
  if (body.caption !== undefined) updateData.caption = body.caption;
  if (body.big !== undefined) updateData.big = body.big;
  if (body.category !== undefined) {
    if (body.category !== null && !VALID_CATEGORY_IDS.has(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    updateData.category = body.category;
  }

  await prisma.galleryPhoto.update({ where: { id }, data: updateData });
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  return NextResponse.json({ ok: true });
}
