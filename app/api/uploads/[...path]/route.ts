import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, basename } from "path";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  // only allow a flat filename — no subdirectory traversal
  const filename = basename(path.join("/"));
  const filePath = join(process.cwd(), "public", "uploads", filename);
  try {
    const file = await readFile(filePath);
    const ext = (filename.split(".").pop() ?? "jpg").toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
