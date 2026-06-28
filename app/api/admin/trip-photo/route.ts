import { NextRequest, NextResponse } from "next/server";
import { assertAdmin } from "@/app/lib/auth";
import { saveUploadedImage } from "@/app/lib/upload";

export async function POST(req: NextRequest) {
  try { await assertAdmin(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try { formData = await req.formData(); } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });

  const result = await saveUploadedImage(file);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ url: result.url });
}
