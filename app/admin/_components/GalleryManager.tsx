"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { GalleryPhoto } from "@/app/actions/gallery";
import { GALLERY_CATEGORIES } from "@/app/lib/gallery-constants";
import {
  updateGalleryPhoto,
  moveGalleryPhoto,
  deleteGalleryPhoto,
} from "@/app/actions/gallery";

export default function GalleryManager({ initialPhotos }: { initialPhotos: GalleryPhoto[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [big, setBig] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", caption);
    fd.append("big", String(big));
    fd.append("category", uploadCategory);
    try {
      const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setUploadError(data.error ?? "อัปโหลดไม่สำเร็จ"); return; }
      setFile(null);
      setCaption("");
      setBig(false);
      setUploadCategory("");
      router.refresh();
    } catch {
      setUploadError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setUploading(false);
    }
  }

  function startEdit(p: GalleryPhoto) {
    setEditingId(p.id);
    setEditCaption(p.caption);
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      await updateGalleryPhoto(id, { caption: editCaption.trim() || editCaption });
      setEditingId(null);
      router.refresh();
    });
  }

  function toggleBig(p: GalleryPhoto) {
    startTransition(async () => {
      await updateGalleryPhoto(p.id, { big: !p.big });
      router.refresh();
    });
  }

  function changeCategory(id: string, cat: string) {
    startTransition(async () => {
      await updateGalleryPhoto(id, { category: cat || null });
      router.refresh();
    });
  }

  function move(id: string, dir: "up" | "down") {
    startTransition(async () => {
      await moveGalleryPhoto(id, dir);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("ลบรูปนี้?")) return;
    startTransition(async () => {
      await deleteGalleryPhoto(id);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Upload form */}
      <div style={{
        background: "#fff", borderRadius: 14, border: "1px solid var(--border-1)",
        boxShadow: "var(--shadow-sm)", padding: "20px 24px", marginBottom: 28,
      }}>
        <h2 style={{ fontFamily: "var(--font-kanit)", fontSize: 15, fontWeight: 700, color: "var(--fg-1)", marginBottom: 16 }}>
          อัปโหลดรูปใหม่
        </h2>
        <form onSubmit={handleUpload} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={labelStyle}>ไฟล์รูป (JPEG / PNG / WebP, ≤ 10 MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ fontFamily: "var(--font-kanit)", fontSize: 13 }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={labelStyle}>คำบรรยาย</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="ใส่คำบรรยายรูป..."
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={labelStyle}>กลุ่มภาพ</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              style={selectStyle}
            >
              <option value="">— ไม่ระบุ —</option>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-kanit)", fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={big} onChange={(e) => setBig(e.target.checked)} />
            รูปใหญ่ (2×2)
          </label>
          <button type="submit" disabled={uploading || !file} style={btnStyle(uploading || !file)}>
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </button>
          {uploadError && (
            <span style={{ color: "#cf1322", fontSize: 13, fontFamily: "var(--font-kanit)" }}>{uploadError}</span>
          )}
        </form>
      </div>

      {/* Photo grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 14,
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 200ms",
      }}>
        {initialPhotos.map((p, idx) => (
          <div key={p.id} style={{
            background: "#fff", borderRadius: 12, border: "1px solid var(--border-1)",
            boxShadow: "var(--shadow-sm)", overflow: "hidden",
          }}>
            {/* Thumbnail */}
            <div style={{ position: "relative", width: "100%", paddingTop: "66%", background: "#f5f5f5" }}>
              <Image
                src={p.src}
                alt={p.caption}
                fill
                sizes="220px"
                style={{ objectFit: "cover" }}
              />
              {p.big && (
                <span style={{
                  position: "absolute", top: 7, left: 7,
                  background: "var(--sup-teal)", color: "#fff",
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                  fontFamily: "var(--font-kanit)",
                }}>ใหญ่</span>
              )}
              {p.category && (
                <span style={{
                  position: "absolute", top: 7, right: 7,
                  fontSize: 18, lineHeight: 1,
                }} title={GALLERY_CATEGORIES.find((c) => c.id === p.category)?.label}>
                  {GALLERY_CATEGORIES.find((c) => c.id === p.category)?.icon}
                </span>
              )}
            </div>

            {/* Caption row */}
            <div style={{ padding: "10px 12px 4px" }}>
              {editingId === p.id ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    autoFocus
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(p.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    style={{ ...inputStyle, flex: 1, fontSize: 13 }}
                  />
                  <button onClick={() => saveEdit(p.id)} style={iconBtn("var(--sup-teal)")}>✓</button>
                  <button onClick={() => setEditingId(null)} style={iconBtn("#aaa")}>✕</button>
                </div>
              ) : (
                <div
                  onClick={() => startEdit(p)}
                  title="คลิกเพื่อแก้ไข"
                  style={{
                    fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-1)",
                    cursor: "text", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    padding: "2px 0",
                  }}
                >{p.caption}</div>
              )}
            </div>

            {/* Category selector */}
            <div style={{ padding: "0 12px 6px" }}>
              <select
                value={p.category ?? ""}
                onChange={(e) => changeCategory(p.id, e.target.value)}
                style={{ ...selectStyle, fontSize: 12, padding: "3px 8px", width: "100%" }}
              >
                <option value="">— ไม่ระบุกลุ่ม —</option>
                {GALLERY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            {/* Action row */}
            <div style={{ padding: "4px 12px 10px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => toggleBig(p)}
                title={p.big ? "เปลี่ยนเป็นรูปเล็ก" : "เปลี่ยนเป็นรูปใหญ่"}
                style={chipBtn(p.big ? "var(--sup-teal)" : "#aaa")}
              >{p.big ? "2×2" : "1×1"}</button>
              <button onClick={() => move(p.id, "up")} disabled={idx === 0} title="ขึ้น" style={iconBtn(idx === 0 ? "#ddd" : "#888")}>↑</button>
              <button onClick={() => move(p.id, "down")} disabled={idx === initialPhotos.length - 1} title="ลง" style={iconBtn(idx === initialPhotos.length - 1 ? "#ddd" : "#888")}>↓</button>
              <button onClick={() => remove(p.id)} title="ลบ" style={{ ...iconBtn("#cf1322"), marginLeft: "auto" }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--fg-3)", fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-kanit)", fontSize: 14, padding: "7px 12px",
  borderRadius: 8, border: "1px solid var(--border-1)",
  outline: "none", color: "var(--fg-1)", background: "#fff",
};

const selectStyle: React.CSSProperties = {
  fontFamily: "var(--font-kanit)", fontSize: 14, padding: "7px 12px",
  borderRadius: 8, border: "1px solid var(--border-1)",
  outline: "none", color: "var(--fg-1)", background: "#fff",
  cursor: "pointer",
};

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--font-kanit)", fontSize: 14, fontWeight: 600,
    padding: "8px 20px", borderRadius: 8, border: "none",
    background: disabled ? "#e8e8e8" : "var(--sup-teal)",
    color: disabled ? "#aaa" : "#fff",
    cursor: disabled ? "default" : "pointer",
    transition: "background 150ms",
  };
}

function iconBtn(color: string): React.CSSProperties {
  return {
    background: "none", border: "1px solid #e8e8e8", borderRadius: 6,
    cursor: "pointer", fontSize: 14, color, padding: "3px 7px", lineHeight: 1,
    fontFamily: "var(--font-kanit)",
  };
}

function chipBtn(color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-kanit)", fontSize: 11, fontWeight: 600,
    padding: "3px 9px", borderRadius: 999,
    border: `1px solid ${color}`, color, background: "transparent",
    cursor: "pointer",
  };
}
