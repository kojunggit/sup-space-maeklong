import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Magic bytes: JPEG=FFD8FF, PNG=89504E47, WebP=52494646...57454250
const MAGIC: Record<string, (b: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png":  (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46
                    && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
};

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number };

export async function saveUploadedImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "รองรับเฉพาะ JPEG, PNG, WebP", status: 400 };
  }

  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);

  // Enforce actual size (not client-reported file.size which can be spoofed)
  if (bytes.byteLength > MAX_BYTES) {
    return { ok: false, error: "ไฟล์ใหญ่เกิน 10MB", status: 400 };
  }

  // Magic-byte validation — reject files whose bytes don't match declared type
  if (!MAGIC[file.type]?.(bytes)) {
    return { ok: false, error: "ไฟล์ไม่ตรงกับประเภทที่ระบุ", status: 400 };
  }

  const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(join(uploadsDir, filename), Buffer.from(bytes));

  return { ok: true, url: `/uploads/${filename}` };
}
