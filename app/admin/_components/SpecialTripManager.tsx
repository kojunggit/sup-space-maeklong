"use client";

import { useState, useTransition, useRef } from "react";
import {
  createSpecialTrip,
  updateSpecialTrip,
  cancelSpecialTrip,
  deleteSpecialTrip,
} from "@/app/actions/special-trips";
import { TIME_SLOTS, formatSlot } from "@/app/_components/trips-data";
import type { SpecialTripRecord } from "@/app/actions/special-trips";

interface Props {
  initialTrips: SpecialTripRecord[];
}

const EMPTY = {
  name: "", description: "", rentalPrice: "", ownBoardPrice: "",
  dateIso: "", timeSlot: "09:00", location: "", maxBoards: "8",
};

// ─── Photo upload field ────────────────────────────────────────────────────────

function PhotoField({
  preview, existing, onFile, onRemove,
}: {
  preview: string | null;
  existing: string | null;
  onFile: (f: File) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const shown = preview ?? existing;
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--fg-3)", fontFamily: "var(--font-kanit)", marginBottom: 6 }}>
        รูปภาพประกอบ (ไม่บังคับ)
      </label>
      {shown ? (
        <div style={{ position: "relative", width: "100%", height: 160, borderRadius: 10, overflow: "hidden", background: "var(--slate-100)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button
            type="button"
            onClick={onRemove}
            style={{
              position: "absolute", top: 8, right: 8,
              width: 28, height: 28, borderRadius: 999,
              border: "none", background: "rgba(0,0,0,0.55)",
              color: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          style={{
            width: "100%", height: 80, borderRadius: 10,
            border: "2px dashed var(--border-2)",
            background: "var(--sand-50)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-3)",
            transition: "border-color 160ms",
          }}
        >
          📷 คลิกเพื่ออัปโหลดรูปภาพ
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Trip row ─────────────────────────────────────────────────────────────────

function TripRow({
  trip, onEdit, onCancel, onDelete, cancelled,
}: {
  trip: SpecialTripRecord;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: (errMsg?: string) => void;
  cancelled?: boolean;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [delPending, startDel] = useTransition();

  const handleDelete = () => {
    startDel(async () => {
      const res = await deleteSpecialTrip(trip.id);
      if (res.ok) {
        onDelete?.();
      } else {
        setConfirmDel(false);
        onDelete?.(res.error);
      }
    });
  };

  return (
    <div style={{
      background: cancelled ? "var(--sand-50)" : "#fff",
      border: `1px solid ${cancelled ? "var(--border-2)" : "var(--border-1)"}`,
      borderRadius: 10, overflow: "hidden",
      opacity: cancelled ? 0.6 : 1,
    }}>
      {/* Cover photo strip */}
      {!cancelled && trip.coverPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={trip.coverPhoto} alt="" style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }} />
      )}

      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#F3E5F5", color: "#7B1FA2", fontFamily: "var(--font-kanit)", whiteSpace: "nowrap" }}>
          ✨ Special
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 600, fontSize: 14, color: "var(--fg-1)" }}>{trip.name}</div>
          <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
            {trip.date} · {formatSlot(trip.timeSlot)} · 📍 {trip.location} · {trip.maxBoards} บอร์ด
          </div>
        </div>

        <div style={{ textAlign: "right", fontFamily: "var(--font-inter)", fontSize: 12, flexShrink: 0 }}>
          <div style={{ color: "var(--sup-teal)", fontWeight: 700 }}>฿{trip.rentalPrice} / ฿{trip.ownBoardPrice}</div>
          <div style={{ color: "var(--fg-4)", fontSize: 10 }}>เช่า / นำมาเอง</div>
        </div>

        {!cancelled && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {confirmDel ? (
              <>
                <span style={{ fontSize: 12, fontFamily: "var(--font-kanit)", color: "var(--danger)", alignSelf: "center" }}>ยืนยันลบ?</span>
                <button onClick={() => setConfirmDel(false)} style={btnStyle("ghost")}>ยกเลิก</button>
                <button onClick={handleDelete} disabled={delPending} style={btnStyle("danger")}>
                  {delPending ? "..." : "ลบ"}
                </button>
              </>
            ) : (
              <>
                {onEdit && <button onClick={onEdit} style={btnStyle("ghost")}>แก้ไข</button>}
                {onCancel && <button onClick={onCancel} style={btnStyle("outline-danger")}>ยกเลิก</button>}
                <button onClick={() => setConfirmDel(true)} style={btnStyle("danger")}>ลบ</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(variant: "ghost" | "danger" | "outline-danger"): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "4px 12px", borderRadius: 6,
    fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 600, cursor: "pointer",
  };
  if (variant === "ghost")
    return { ...base, border: "1px solid var(--border-2)", background: "#fff", color: "var(--fg-2)" };
  if (variant === "danger")
    return { ...base, border: "1px solid var(--danger)", background: "var(--danger)", color: "#fff" };
  return { ...base, border: "1px solid var(--danger)", background: "#fff", color: "var(--danger)" };
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SpecialTripManager({ initialTrips }: Props) {
  const [trips, setTrips]       = useState(initialTrips);
  const [form, setForm]         = useState(EMPTY);
  const [mode, setMode]         = useState<"create" | "edit">("create");
  const [editId, setEditId]     = useState<string | null>(null);
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const resetForm = () => {
    setForm(EMPTY);
    setMode("create");
    setEditId(null);
    setPhotoFile(null);
    setPhotoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setExistingPhoto(null);
    setSaved(false);
    setError(null);
  };

  const handlePhotoFile = (f: File) => {
    setPhotoFile(f);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const handlePhotoRemove = () => {
    setPhotoFile(null);
    setPhotoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setExistingPhoto(null);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return existingPhoto;
    const fd = new FormData();
    fd.append("file", photoFile);
    const res = await fetch("/api/admin/trip-photo", { method: "POST", body: fd });
    if (!res.ok) return existingPhoto;
    const data = await res.json();
    return data.url ?? null;
  };

  const missingFields = () => {
    const m: string[] = [];
    if (!form.name.trim())                 m.push("ชื่อทริป");
    if (!form.dateIso)                     m.push("วันที่");
    if (!form.location.trim())             m.push("สถานที่");
    if (!(Number(form.rentalPrice) > 0))   m.push("ราคาเช่าบอร์ด");
    if (!(Number(form.ownBoardPrice) > 0)) m.push("ราคานำบอร์ดมาเอง");
    return m;
  };

  const handleSubmit = () => {
    setSaved(false); setError(null);
    const missing = missingFields();
    if (missing.length > 0) { setError(`กรุณากรอก: ${missing.join(", ")}`); return; }

    startTransition(async () => {
      const coverPhoto = await uploadPhoto();
      const payload = {
        name:          form.name.trim(),
        description:   form.description.trim() || undefined,
        rentalPrice:   Number(form.rentalPrice),
        ownBoardPrice: Number(form.ownBoardPrice),
        dateIso:       form.dateIso,
        timeSlot:      form.timeSlot,
        location:      form.location.trim(),
        maxBoards:     Math.max(1, Number(form.maxBoards) || 8),
        coverPhoto:    coverPhoto ?? undefined,
      };

      if (mode === "edit" && editId) {
        const res = await updateSpecialTrip(editId, payload);
        if (res.ok) {
          const d = new Date(form.dateIso + "T00:00:00");
          const THAI_S = ["อา","จ.","อ.","พ.","พฤ","ศ.","ส."];
          const THAI_M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
          setTrips((prev) => prev.map((t) =>
            t.id === editId
              ? { ...t, ...payload, description: payload.description ?? null, coverPhoto: coverPhoto ?? null, date: `${THAI_S[d.getDay()]} ${d.getDate()} ${THAI_M[d.getMonth()]}` }
              : t
          ));
          setSaved(true);
          setTimeout(() => { setSaved(false); resetForm(); }, 1800);
        } else {
          setError("ไม่สามารถบันทึกได้ กรุณาลองใหม่");
        }
      } else {
        const res = await createSpecialTrip(payload);
        if (res.ok) {
          setSaved(true);
          const d = new Date(form.dateIso + "T00:00:00");
          const THAI_S = ["อา","จ.","อ.","พ.","พฤ","ศ.","ส."];
          const THAI_M = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
          const newTrip: SpecialTripRecord = {
            id:            res.id!,
            ...payload,
            coverPhoto:    coverPhoto ?? null,
            description:   payload.description ?? null,
            date:          `${THAI_S[d.getDay()]} ${d.getDate()} ${THAI_M[d.getMonth()]}`,
            status:        "ACTIVE",
            createdAt:     new Date().toISOString(),
          };
          setTrips((prev) => [newTrip, ...prev]);
          setTimeout(() => { setSaved(false); resetForm(); }, 1800);
        } else {
          setError("ไม่สามารถสร้างทริปได้ กรุณาลองใหม่");
        }
      }
    });
  };

  const handleEdit = (trip: SpecialTripRecord) => {
    setMode("edit");
    setEditId(trip.id);
    setForm({
      name:          trip.name,
      description:   trip.description ?? "",
      rentalPrice:   String(trip.rentalPrice),
      ownBoardPrice: String(trip.ownBoardPrice),
      dateIso:       trip.dateIso,
      timeSlot:      trip.timeSlot,
      location:      trip.location,
      maxBoards:     String(trip.maxBoards),
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setExistingPhoto(trip.coverPhoto ?? null);
    setSaved(false);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = (id: string) => {
    setTrips((prev) => prev.map((t) => t.id === id ? { ...t, status: "CANCELLED" } : t));
    startTransition(async () => {
      const res = await cancelSpecialTrip(id);
      if (!res.ok) setTrips((prev) => prev.map((t) => t.id === id ? { ...t, status: "ACTIVE" } : t));
    });
    if (editId === id) resetForm();
  };

  const handleDelete = (id: string, errMsg?: string) => {
    if (errMsg) { setError(errMsg); return; }
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (editId === id) resetForm();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "8px 12px",
    borderRadius: 8, border: "1.5px solid var(--border-2)",
    fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-1)",
    background: "#fafafa", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 500,
    color: "var(--fg-3)", fontFamily: "var(--font-kanit)", marginBottom: 4,
  };

  const activeTrips    = trips.filter((t) => t.status === "ACTIVE");
  const cancelledTrips = trips.filter((t) => t.status === "CANCELLED");

  return (
    <div style={{ display: "grid", gap: 16 }}>

      {/* ─── Form (create / edit) ─── */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: 20,
        boxShadow: "var(--shadow-sm)", border: `1.5px solid ${mode === "edit" ? "#7B1FA2" : "var(--border-1)"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{mode === "edit" ? "✏️" : "✨"}</span>
            <div>
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600, color: "var(--fg-1)" }}>
                {mode === "edit" ? "แก้ไขทริปพิเศษ" : "สร้างทริปพิเศษ"}
              </div>
              <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>
                {mode === "edit" ? `กำลังแก้ไข: ${trips.find(t => t.id === editId)?.name ?? ""}` : "ทริปนี้จะแสดงบนเว็บให้ลูกค้าเลือกจอง"}
              </div>
            </div>
          </div>
          {mode === "edit" && (
            <button onClick={resetForm} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid var(--border-2)", background: "#fff", fontFamily: "var(--font-kanit)", fontSize: 12, cursor: "pointer", color: "var(--fg-2)" }}>
              + สร้างใหม่
            </button>
          )}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {/* Photo */}
          <PhotoField
            preview={photoPreview}
            existing={existingPhoto}
            onFile={handlePhotoFile}
            onRemove={handlePhotoRemove}
          />

          {/* Name */}
          <div>
            <label style={labelStyle}>ชื่อทริป *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="เช่น ทริปพิเศษ Sunset พายชมพระอาทิตย์ตก" style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>รายละเอียดทริป</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="บอกรายละเอียด เส้นทาง กิจกรรมที่น่าสนใจ..." rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>ราคาเช่าบอร์ด / คน (฿) *</label>
              <input type="number" min={0} value={form.rentalPrice}
                onChange={(e) => set("rentalPrice", e.target.value)} placeholder="700" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ราคานำบอร์ดมาเอง / คน (฿) *</label>
              <input type="number" min={0} value={form.ownBoardPrice}
                onChange={(e) => set("ownBoardPrice", e.target.value)} placeholder="300" style={inputStyle} />
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>วันที่ *</label>
              <input type="date" value={form.dateIso} onChange={(e) => set("dateIso", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>เวลาเริ่ม *</label>
              <select value={form.timeSlot} onChange={(e) => set("timeSlot", e.target.value)} style={inputStyle}>
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>{formatSlot(s)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location + Capacity */}
          <div className="grid grid-cols-1 gap-3 sm:[grid-template-columns:2fr_1fr]">
            <div>
              <label style={labelStyle}>สถานที่นัดหมาย *</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)}
                placeholder="เช่น ท่าน้ำหน้าร้าน SUP Space" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ความจุ (บอร์ด)</label>
              <input type="number" min={1} max={50} value={form.maxBoards}
                onChange={(e) => set("maxBoards", e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
          {saved && (
            <span style={{ fontSize: 13, color: "#389E0D", fontWeight: 600 }}>
              ✓ {mode === "edit" ? "บันทึกเรียบร้อย" : "สร้างทริปเรียบร้อย"}
            </span>
          )}
          {error && <span style={{ fontSize: 13, color: "var(--danger)", fontWeight: 600 }}>{error}</span>}
          <button
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              marginLeft: "auto", padding: "9px 24px", borderRadius: 8, border: "none",
              background: isPending ? "var(--border-2)" : mode === "edit" ? "#7B1FA2" : "var(--sup-teal)",
              color: isPending ? "var(--fg-4)" : "#fff",
              fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              transition: "all 160ms",
            }}
          >
            {isPending ? "กำลังบันทึก..." : mode === "edit" ? "✏️ บันทึกการแก้ไข" : "✨ สร้างทริปพิเศษ"}
          </button>
        </div>
      </div>

      {/* ─── Active trips ─── */}
      {activeTrips.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700, color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
            ทริปที่กำลังจะมา ({activeTrips.length})
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {activeTrips.map((t) => (
              <TripRow
                key={t.id}
                trip={t}
                onEdit={() => handleEdit(t)}
                onCancel={() => handleCancel(t.id)}
                onDelete={(err) => handleDelete(t.id, err)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Cancelled trips ─── */}
      {cancelledTrips.length > 0 && (
        <div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700, color: "var(--fg-4)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
            ยกเลิกแล้ว ({cancelledTrips.length})
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {cancelledTrips.map((t) => (
              <TripRow
                key={t.id}
                trip={t}
                cancelled
                onDelete={(err) => handleDelete(t.id, err)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
