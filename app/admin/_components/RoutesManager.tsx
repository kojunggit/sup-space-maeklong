"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  createRoute, updateRoute, deleteRoute,
  addRoutePhoto, deleteRoutePhoto,
  type DBRoute, type RouteFormData,
} from "@/app/actions/routes";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "list" | "add" | "edit";

const CATS = [
  { id: "short",  label: "สั้น (Short)" },
  { id: "medium", label: "กลาง (Medium)" },
  { id: "long",   label: "ไกล (Long)" },
];

const EMPTY_FORM: RouteFormData = {
  id: "", cat: "short", name: "", note: "", nameEn: "", noteEn: "",
  descTh: "", descEn: "", warnTh: "", warnEn: "",
  km: 3, price: 500, duration: 2, recommend: false,
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border-2)", borderRadius: 8, padding: "9px 12px",
  fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-1)",
  background: "#fff", outline: "none", width: "100%", boxSizing: "border-box",
};

const taStyle: React.CSSProperties = { ...inputStyle, minHeight: 80, resize: "vertical" };

// ─── Route Form ───────────────────────────────────────────────────────────────

function RouteForm({
  initial, isNew, onSave, onCancel,
}: {
  initial: RouteFormData;
  isNew: boolean;
  onSave: (data: RouteFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<RouteFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"th" | "en">("th");

  const set = (k: keyof RouteFormData, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert("กรุณากรอกชื่อเส้นทาง (ภาษาไทย)");
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      console.error("Route save failed:", err);
      alert("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  const tabBtn = (t: "th" | "en") => ({
    padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
    fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
    background: tab === t ? "var(--sup-teal)" : "var(--sand-100)",
    color: tab === t ? "#fff" : "var(--fg-2)",
  } as React.CSSProperties);

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Basic info — mobile: 2 full-width fields + 3 numbers in a row; desktop: single row */}
      <div className="grid grid-cols-6 gap-3 md:[grid-template-columns:1fr_1fr_100px_100px_100px]">
        <Field label="Category" className="col-span-6 md:col-span-1">
          <select value={form.cat} onChange={(e) => set("cat", e.target.value)} style={inputStyle}>
            {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label={isNew ? "Route ID (slug)" : "Route ID"} className="col-span-6 md:col-span-1">
          <input
            style={{ ...inputStyle, background: isNew ? "#fff" : "var(--sand-50)", color: isNew ? "var(--fg-1)" : "var(--fg-3)" }}
            value={form.id} onChange={(e) => set("id", e.target.value)}
            placeholder="e.g. my-route (ว่างไว้ = auto-generate)"
            readOnly={!isNew}
          />
        </Field>
        <Field label="ระยะ (กม)" className="col-span-2 md:col-span-1">
          <input type="number" step="0.1" min="0" style={inputStyle} value={form.km} onChange={(e) => set("km", parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="ราคา (฿)" className="col-span-2 md:col-span-1">
          <input type="number" step="50" min="0" style={inputStyle} value={form.price} onChange={(e) => set("price", parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="ระยะเวลา (ชม)" className="col-span-2 md:col-span-1">
          <input type="number" step="0.5" min="1" style={inputStyle} value={form.duration} onChange={(e) => set("duration", parseFloat(e.target.value) || 2)} />
        </Field>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
        <input type="checkbox" checked={form.recommend} onChange={(e) => set("recommend", e.target.checked)} style={{ width: 16, height: 16 }} />
        <span style={{ fontFamily: "var(--font-kanit)", fontSize: 14 }}>แสดง badge "RECOMMEND"</span>
      </label>

      {/* Language tabs */}
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" style={tabBtn("th")} onClick={() => setTab("th")}>ไทย</button>
          <button type="button" style={tabBtn("en")} onClick={() => setTab("en")}>English</button>
        </div>

        {tab === "th" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="ชื่อเส้นทาง (ไทย) *">
              <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="ร้านกาแฟภพรัก" required />
            </Field>
            <Field label="ชื่อย่อ / tagline (ไทย)">
              <input style={inputStyle} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="พายเข้าคลองเม้ง · สวนมะพร้าว · กาแฟพิเศษ" />
            </Field>
            <Field label="คำอธิบายเต็ม (ไทย)">
              <textarea style={taStyle} value={form.descTh} onChange={(e) => set("descTh", e.target.value)} placeholder="รายละเอียดเส้นทางภาษาไทย..." />
            </Field>
            <Field label="คำเตือน (ไทย) — ว่างไว้ถ้าไม่มี">
              <input style={inputStyle} value={form.warnTh} onChange={(e) => set("warnTh", e.target.value)} placeholder="⚠ ควรเริ่มพายก่อน 08:00 น. ..." />
            </Field>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Route name (EN)">
              <input style={inputStyle} value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} placeholder="Phoprak Coffee" />
            </Field>
            <Field label="Short tagline (EN)">
              <input style={inputStyle} value={form.noteEn} onChange={(e) => set("noteEn", e.target.value)} placeholder="Paddle into Khlong Meng · coconut groves · specialty coffee" />
            </Field>
            <Field label="Full description (EN)">
              <textarea style={taStyle} value={form.descEn} onChange={(e) => set("descEn", e.target.value)} placeholder="English description..." />
            </Field>
            <Field label="Warning (EN) — leave blank if none">
              <input style={inputStyle} value={form.warnEn} onChange={(e) => set("warnEn", e.target.value)} placeholder="⚠ Start before 08:00 ..." />
            </Field>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" disabled={saving} style={{
          padding: "10px 24px", borderRadius: 8, border: "none", cursor: saving ? "not-allowed" : "pointer",
          background: "var(--sup-teal)", color: "#fff", fontFamily: "var(--font-kanit)", fontSize: 14, fontWeight: 700,
          opacity: saving ? 0.6 : 1,
        }}>
          {saving ? "กำลังบันทึก..." : isNew ? "เพิ่มเส้นทาง" : "บันทึกการแก้ไข"}
        </button>
        <button type="button" onClick={onCancel} style={{
          padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-2)", cursor: "pointer",
          background: "#fff", fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-2)",
        }}>ยกเลิก</button>
      </div>
    </form>
  );
}

// ─── Photo manager for a single route ────────────────────────────────────────

function RoutePhotos({ route, onRefresh }: { route: DBRoute; onRefresh: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/route-photo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) return alert(data.error ?? "อัปโหลดไม่สำเร็จ");
      await addRoutePhoto(route.id, data.url, caption.trim());
      setCaption("");
      onRefresh();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    if (!confirm("ลบภาพนี้?")) return;
    await deleteRoutePhoto(photoId);
    onRefresh();
  }

  return (
    <div style={{ marginTop: 16, padding: 16, background: "var(--sand-50)", borderRadius: 10, border: "1px dashed var(--border-2)" }}>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600, color: "var(--fg-2)", marginBottom: 12 }}>
        ภาพตัวอย่างเส้นทาง ({route.photos.length} ภาพ)
      </div>

      {/* Existing photos */}
      {route.photos.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          {route.photos.map((p) => (
            <div key={p.id} style={{ position: "relative", width: 110, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-1)", background: "#fff" }}>
              <div style={{ position: "relative", width: 110, height: 80 }}>
                <Image src={p.src} alt={p.caption || route.name} fill style={{ objectFit: "cover" }} sizes="110px" />
              </div>
              {p.caption && (
                <div style={{ padding: "4px 6px", fontFamily: "var(--font-kanit)", fontSize: 10, color: "var(--fg-3)", lineHeight: 1.3, maxHeight: 36, overflow: "hidden" }}>
                  {p.caption}
                </div>
              )}
              <button
                onClick={() => handleDelete(p.id)}
                style={{
                  position: "absolute", top: 4, right: 4,
                  width: 22, height: 22, borderRadius: 999,
                  background: "rgba(0,0,0,0.65)", color: "#fff",
                  border: "none", cursor: "pointer", fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Upload */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 11, color: "var(--fg-3)", marginBottom: 4 }}>คำบรรยายภาพ (ไม่บังคับ)</div>
          <input
            style={{ ...inputStyle, fontSize: 13 }}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="เช่น วิวคลองบ้านใต้"
          />
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          style={{
            padding: "9px 18px", borderRadius: 8, border: "1.5px dashed var(--sup-teal)",
            background: "#fff", color: "var(--sup-teal)", cursor: uploading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "กำลังอัปโหลด..." : "+ เพิ่มภาพ"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ─── Route row ────────────────────────────────────────────────────────────────

function RouteRow({
  route, onEdit, onDelete, onRefresh,
}: {
  route: DBRoute;
  onEdit: (r: DBRoute) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  const [showPhotos, setShowPhotos] = useState(false);

  const catColor = { short: "var(--sup-teal)", medium: "var(--sup-orange)", long: "var(--sup-dark)" }[route.cat] ?? "var(--fg-3)";

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid var(--border-1)", overflow: "hidden", marginBottom: 10 }}>
      <div className="flex flex-wrap items-center gap-3 p-3 md:px-4 md:py-3.5">
        <div style={{ width: 4, alignSelf: "stretch", background: catColor, borderRadius: 2, flexShrink: 0 }} />

        {/* Cover photo thumbnail */}
        {route.photos[0] ? (
          <div style={{ width: 56, height: 44, borderRadius: 6, overflow: "hidden", flexShrink: 0, position: "relative" }}>
            <Image src={route.photos[0].src} alt={route.name} fill style={{ objectFit: "cover" }} sizes="56px" />
          </div>
        ) : (
          <div style={{ width: 56, height: 44, borderRadius: 6, background: "var(--sand-100)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏄</div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 15, color: "var(--fg-1)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {route.name}
            {route.recommend && (
              <span style={{ fontSize: 10, background: "var(--sup-orange)", color: "#fff", padding: "2px 7px", borderRadius: 999, fontWeight: 700 }}>REC</span>
            )}
          </div>
          <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
            {route.nameEn || "–"} · {route.km} กม · {route.duration} ชม · ฿{route.price.toLocaleString()} · {route.photos.length} ภาพ
          </div>
        </div>

        <div className="flex gap-2 shrink-0 w-full justify-end sm:w-auto">
          <button
            onClick={() => setShowPhotos((p) => !p)}
            style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border-2)", cursor: "pointer", background: showPhotos ? "var(--sand-100)" : "#fff", fontSize: 12, fontFamily: "var(--font-kanit)", color: "var(--fg-2)" }}
          >
            {showPhotos ? "ซ่อนภาพ" : `ภาพ (${route.photos.length})`}
          </button>
          <button
            onClick={() => onEdit(route)}
            style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid var(--sup-teal)", cursor: "pointer", background: "#fff", fontSize: 12, fontFamily: "var(--font-kanit)", color: "var(--sup-teal)", fontWeight: 600 }}
          >แก้ไข</button>
          <button
            onClick={() => onDelete(route.id)}
            style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid #fca5a5", cursor: "pointer", background: "#fff", fontSize: 12, fontFamily: "var(--font-kanit)", color: "#dc2626" }}
          >ลบ</button>
        </div>
      </div>

      {showPhotos && (
        <div style={{ borderTop: "1px solid var(--border-1)", padding: "0 16px 16px" }}>
          <RoutePhotos route={route} onRefresh={onRefresh} />
        </div>
      )}
    </div>
  );
}

// ─── Main manager ─────────────────────────────────────────────────────────────

export default function RoutesManager({ initialRoutes }: { initialRoutes: DBRoute[] }) {
  const router = useRouter();
  const [routes, setRoutes] = useState<DBRoute[]>(initialRoutes);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<DBRoute | null>(null);

  useEffect(() => { setRoutes(initialRoutes); }, [initialRoutes]);

  function refresh() { router.refresh(); }

  const byCategory = (cat: string) => routes.filter((r) => r.cat === cat);

  async function handleAdd(data: RouteFormData) {
    await createRoute(data);
    setMode("list");
    router.refresh();
  }

  async function handleUpdate(data: RouteFormData) {
    if (!editing) return;
    await updateRoute(editing.id, data);
    setMode("list");
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบเส้นทางนี้? ข้อมูลทั้งหมดรวมถึงภาพจะถูกลบ")) return;
    await deleteRoute(id);
    router.refresh();
  }

  function startEdit(r: DBRoute) {
    setEditing(r);
    setMode("edit");
  }

  return (
    <div className="p-4 md:p-6 max-w-[960px] mx-auto">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 22, color: "var(--fg-1)" }}>
            จัดการเส้นทางพาย
          </h2>
          <div style={{ fontFamily: "var(--font-kanit)", fontSize: 14, color: "var(--fg-3)", marginTop: 4 }}>
            {routes.length} เส้นทาง · แก้ไขเนื้อหา TH/EN และภาพตัวอย่างแต่ละเส้นทาง
          </div>
        </div>
        {mode === "list" && (
          <button
            onClick={() => setMode("add")}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "var(--sup-teal)", color: "#fff", fontFamily: "var(--font-kanit)", fontSize: 14, fontWeight: 700 }}
          >+ เพิ่มเส้นทางใหม่</button>
        )}
      </div>

      {/* Add form */}
      {mode === "add" && (
        <div className="p-4 md:p-6" style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border-1)", marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontFamily: "var(--font-kanit)", fontSize: 17, fontWeight: 700 }}>เพิ่มเส้นทางใหม่</h3>
          <RouteForm
            initial={EMPTY_FORM}
            isNew={true}
            onSave={handleAdd}
            onCancel={() => setMode("list")}
          />
        </div>
      )}

      {/* Edit form */}
      {mode === "edit" && editing && (
        <div className="p-4 md:p-6" style={{ background: "#fff", borderRadius: 12, border: "2px solid var(--sup-teal)", marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontFamily: "var(--font-kanit)", fontSize: 17, fontWeight: 700 }}>แก้ไข: {editing.name}</h3>
          <RouteForm
            initial={(({ photos, order, ...rest }) => rest)(editing)}
            isNew={false}
            onSave={handleUpdate}
            onCancel={() => { setMode("list"); setEditing(null); }}
          />
        </div>
      )}

      {/* Route list */}
      {mode === "list" && (
        <div>
          {[
            { id: "short", label: "ระยะสั้น", color: "var(--sup-teal)" },
            { id: "medium", label: "ระยะกลาง", color: "var(--sup-orange)" },
            { id: "long", label: "ระยะไกล", color: "var(--sup-dark)" },
          ].map(({ id, label, color }) => {
            const rows = byCategory(id);
            if (rows.length === 0) return null;
            return (
              <div key={id} style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, marginBottom: 10 }}>
                  {label} ({rows.length})
                </div>
                {rows.map((r) => (
                  <RouteRow
                    key={r.id}
                    route={r}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    onRefresh={refresh}
                  />
                ))}
              </div>
            );
          })}

          {routes.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "var(--fg-3)", fontFamily: "var(--font-kanit)" }}>
              ยังไม่มีเส้นทาง — กดปุ่ม "เพิ่มเส้นทางใหม่" เพื่อเริ่มต้น
            </div>
          )}
        </div>
      )}
    </div>
  );
}
