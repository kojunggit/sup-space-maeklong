"use client";

import { useState, useEffect } from "react";
import {
  TIMESLOTS, ROUTES, CATEGORIES, SKILLS, ROUTES_BY_ID,
  PRIVATE_PHOTO_PRICE,
  type UpcomingTrip, type RouteCategory, type TimeSlotId, type SkillLevel,
} from "./trips-data";
import { createBooking } from "../actions/booking";

// ─── Date utilities ───────────────────────────────────────────────────────────

const THAI_DAYS   = ["อา", "จ.", "อ.", "พ.", "พฤ", "ศ.", "ส."];
const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoToLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${THAI_DAYS[d.getDay()]} ${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`;
}
function generateDays(count = 14) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getTime() + i * 86_400_000);
    return { iso: toIso(d), d: THAI_DAYS[d.getDay()], n: String(d.getDate()), sub: THAI_MONTHS[d.getMonth()] };
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvailDay { date: string; morning: boolean; afternoon: boolean; available: boolean; }
type PhotoPermission = "allow" | "notAllow" | "private";

const PHOTO_OPTIONS: { id: PhotoPermission; label: string; sub: string; badge?: string }[] = [
  { id: "allow",    label: "อนุญาต",    sub: "ให้ใช้ภาพใน Social ได้ · ได้รับภาพเป็นที่ระลึก" },
  { id: "notAllow", label: "ไม่อนุญาต", sub: "ไม่ต้องการให้ถ่ายภาพ" },
  { id: "private",  label: "Private",   sub: "ได้ภาพส่วนตัว · ไม่เผยแพร่ใน Social", badge: `+฿${PRIVATE_PHOTO_PRICE}/คน` },
];

// ─── Contact channel ──────────────────────────────────────────────────────────

type ContactChannel = "line" | "whatsapp" | "messenger";

const CONTACT_CHANNELS: { id: ContactChannel; label: string; icon: string; placeholder: string }[] = [
  { id: "line",      label: "LINE",      icon: "💬", placeholder: "LINE ID หรือ @username" },
  { id: "whatsapp",  label: "WhatsApp",  icon: "📲", placeholder: "เบอร์โทร WhatsApp" },
  { id: "messenger", label: "Messenger", icon: "🗨️",  placeholder: "ชื่อ Facebook / username" },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 500, color: "var(--fg-2)", marginBottom: 10 }}>{children}</div>;
}
function TrustChip({ label }: { label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-kanit)", fontWeight: 400, color: "var(--fg-2)", whiteSpace: "nowrap" }}>
      <span style={{ width: 16, height: 16, borderRadius: 999, background: "var(--success-soft)", color: "var(--success)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>✓</span>
      {label}
    </span>
  );
}
function Stepper({ value, setValue, min, max }: { value: number; setValue: (v: number) => void; min: number; max: number }) {
  const btn: React.CSSProperties = { width: 36, height: 36, borderRadius: 999, border: "1.5px solid var(--sup-teal)", background: "#fff", color: "var(--sup-teal)", fontSize: 20, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={() => setValue(Math.max(min, value - 1))} style={btn} aria-label="ลด">−</button>
      <div style={{ fontFamily: "var(--font-inter)", fontSize: 22, fontWeight: 700, color: "var(--fg-1)", minWidth: 28, textAlign: "center" }}>{value}</div>
      <button onClick={() => setValue(Math.min(max, value + 1))} style={btn} aria-label="เพิ่ม">+</button>
    </div>
  );
}
function Row({ k, v, big, muted }: { k: string; v: string; big?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", alignItems: "baseline", gap: 12 }}>
      <span style={{ fontSize: 13, color: "var(--fg-3)", fontWeight: 300, whiteSpace: "nowrap", flexShrink: 0 }}>{k}</span>
      <span style={{ fontFamily: big ? "var(--font-inter)" : "var(--font-kanit)", fontSize: big ? 22 : 14, fontWeight: big ? 700 : 500, color: muted ? "var(--fg-3)" : "var(--fg-1)", textAlign: "right", whiteSpace: "nowrap" }}>{v}</span>
    </div>
  );
}

// ─── Step 1: Date ─────────────────────────────────────────────────────────────

function StepWhen({ dateIso, onSelect, availability, loading, weekOffset, setWeekOffset }: {
  dateIso: string; onSelect: (iso: string) => void;
  availability: AvailDay[]; loading: boolean;
  weekOffset: number; setWeekOffset: (n: number) => void;
}) {
  const allDays = generateDays(14);
  const days = allDays.slice(weekOffset * 7, weekOffset * 7 + 7);

  return (
    <div>
      <Label>เลือกวันที่</Label>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <button onClick={() => setWeekOffset(0)} disabled={weekOffset === 0} className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px", opacity: weekOffset === 0 ? 0.35 : 1 }}>← สัปดาห์นี้</button>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "var(--fg-3)", fontWeight: 500 }}>{weekOffset === 0 ? "7 วันข้างหน้า" : "7 วันถัดไป"}</span>
        <button onClick={() => setWeekOffset(1)} disabled={weekOffset === 1} className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px", opacity: weekOffset === 1 ? 0.35 : 1 }}>สัปดาห์หน้า →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {days.map((d) => {
          const avail = availability.find((a) => a.date === d.iso);
          const isAvail = loading || !avail || avail.available;
          const selected = dateIso === d.iso;
          return (
            <button key={d.iso} onClick={() => isAvail && onSelect(d.iso)} disabled={!isAvail}
              style={{ padding: "12px 4px", borderRadius: 10, position: "relative", cursor: isAvail ? "pointer" : "not-allowed", border: selected ? "2px solid var(--sup-orange)" : "1.5px solid var(--border-2)", background: selected ? "#FFF4E5" : (isAvail ? "#fff" : "var(--slate-100)"), color: selected ? "var(--orange-700)" : (isAvail ? "var(--fg-1)" : "var(--fg-4)"), opacity: isAvail ? 1 : 0.5, fontFamily: "var(--font-kanit)", transition: "all 180ms var(--ease-out)" }}>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}>{d.d}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 20, fontWeight: 700, marginTop: 2 }}>{d.n}</div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>{d.sub}</div>
              {!loading && avail && (
                <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, borderRadius: 999, background: avail.available ? "var(--success)" : "var(--danger)" }} />
              )}
              {loading && <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, borderRadius: 999, background: "var(--sand-200)", animation: "pulse 1.5s ease-in-out infinite" }} />}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--teal-50)", borderRadius: 8, fontSize: 13, color: "var(--teal-700)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>เคล็ดลับ —</span>
        <span>{loading ? "กำลังตรวจสอบวันว่าง..." : "จุดเขียว = ยังมีที่ว่าง · จุดแดง = เต็มแล้ว · ยืนยันใน LINE ภายใน 1 ชม."}</span>
      </div>
    </div>
  );
}

// ─── Step 2: Time ─────────────────────────────────────────────────────────────

function StepTime({ timeSlot, setTimeSlot, availability, dateIso }: {
  timeSlot: TimeSlotId; setTimeSlot: (t: TimeSlotId) => void;
  availability: AvailDay[]; dateIso: string;
}) {
  const dayAvail = availability.find((d) => d.date === dateIso);
  const slotAvail = (id: TimeSlotId) => !dayAvail || (id === "MORNING" ? dayAvail.morning : dayAvail.afternoon);
  return (
    <div>
      <Label>เลือกรอบ</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {TIMESLOTS.map((t) => {
          const avail = slotAvail(t.id);
          const selected = timeSlot === t.id;
          return (
            <button key={t.id} onClick={() => avail && setTimeSlot(t.id)} disabled={!avail}
              style={{ textAlign: "left", padding: "20px 18px", borderRadius: 12, position: "relative", border: selected ? "2px solid var(--sup-orange)" : "1.5px solid var(--border-2)", background: selected ? "#FFF4E5" : (avail ? "#fff" : "var(--slate-100)"), cursor: avail ? "pointer" : "not-allowed", fontFamily: "var(--font-kanit)", opacity: avail ? 1 : 0.5, transition: "all 180ms var(--ease-out)" }}>
              <div style={{ fontSize: 28, color: selected ? "var(--sup-orange)" : "var(--slate-300)", lineHeight: 1, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "var(--fg-1)", whiteSpace: "nowrap" }}>{t.label}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--fg-3)", marginTop: 2, whiteSpace: "nowrap" }}>{t.time}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>{t.en}</div>
              {!avail && <span style={{ position: "absolute", top: 10, right: 10, background: "var(--danger)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>เต็มแล้ว</span>}
            </button>
          );
        })}
      </div>
      <p style={{ marginTop: 14, fontFamily: "var(--font-kanit)", fontSize: 13, color: "var(--fg-3)", fontWeight: 300, lineHeight: 1.5 }}>
        ทริปบางเส้นทางต้องออกก่อน 08.00 น. (ดำเนินสะดวก) · ทริประยะใกล้รอบเย็นเฉพาะดำเนินพวา
      </p>
    </div>
  );
}

// ─── Step 3: Route ────────────────────────────────────────────────────────────

function StepRoute({ route, setRoute, routeCat, setRouteCat }: {
  route: string; setRoute: (r: string) => void;
  routeCat: RouteCategory; setRouteCat: (c: RouteCategory) => void;
}) {
  const filtered = ROUTES.filter((r) => r.cat === routeCat);
  const catInfo = CATEGORIES.find((c) => c.id === routeCat)!;
  return (
    <div>
      <Label>เลือกเส้นทาง</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, background: "var(--sand-50)", padding: 4, borderRadius: 10, marginBottom: 12 }}>
        {CATEGORIES.map((c) => {
          const sel = routeCat === c.id;
          return (
            <button key={c.id} onClick={() => setRouteCat(c.id as RouteCategory)} style={{ padding: "8px 6px", borderRadius: 8, border: "none", background: sel ? "#fff" : "transparent", boxShadow: sel ? "var(--shadow-sm)" : "none", cursor: "pointer", fontFamily: "var(--font-kanit)", color: sel ? "var(--sup-teal)" : "var(--fg-2)", fontWeight: sel ? 700 : 500, transition: "all 160ms var(--ease-out)" }}>
              <div style={{ fontSize: 14, whiteSpace: "nowrap" }}>{c.label}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 500, color: sel ? "var(--sup-teal)" : "var(--fg-3)", marginTop: 2, whiteSpace: "nowrap" }}>{c.sub}</div>
            </button>
          );
        })}
      </div>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--sup-teal)", fontWeight: 500, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--sup-teal)", flexShrink: 0 }} />
        เหมาะกับ: {catInfo.skill}
      </div>
      <div style={{ display: "grid", gap: 8, maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
        {filtered.map((r) => {
          const sel = route === r.id;
          return (
            <button key={r.id} onClick={() => setRoute(r.id)} style={{ textAlign: "left", padding: "11px 14px", borderRadius: 10, border: sel ? "2px solid var(--sup-orange)" : "1.5px solid var(--border-2)", background: sel ? "#FFF4E5" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-kanit)", transition: "all 180ms var(--ease-out)" }}>
              <span style={{ width: 18, height: 18, borderRadius: 999, border: sel ? "6px solid var(--sup-orange)" : "2px solid var(--slate-300)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 500, fontSize: 15, color: "var(--fg-1)" }}>{r.name}</span>
                  {r.recommend && <span style={{ background: "var(--sup-orange)", color: "#fff", fontFamily: "var(--font-inter)", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>RECOMMEND</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 300, marginTop: 2, lineHeight: 1.4 }}>{r.note}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, color: "var(--sup-teal)", fontSize: 17, whiteSpace: "nowrap" }}>฿{r.price}</div>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "var(--fg-3)", whiteSpace: "nowrap" }}>{r.km} กม</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: Paddlers ─────────────────────────────────────────────────────────

function getBoardName(w: number) { return w < 60 ? 'บอร์ด S (10\'4")' : w < 85 ? 'บอร์ด M (10\'8")' : 'บอร์ด L (11\'6")'; }

function StepPaddlers({ paddlers, setPaddlers, skill, setSkill, weight, setWeight }: {
  paddlers: number; setPaddlers: (n: number) => void;
  skill: SkillLevel; setSkill: (s: SkillLevel) => void;
  weight: number; setWeight: (w: number) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <Label>จำนวนบอร์ด</Label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--sand-50)", borderRadius: 10, border: "1.5px solid var(--border-2)" }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 16, color: "var(--fg-1)" }}>ผู้ใหญ่ · 1 บอร์ด/คน</div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 300 }}>อายุ 12+ ปี</div>
          </div>
          <Stepper value={paddlers} setValue={setPaddlers} min={1} max={10} />
        </div>
      </div>
      <div>
        <Label>ระดับฝีมือ</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {SKILLS.map((s) => {
            const sel = skill === s.id;
            return (
              <button key={s.id} onClick={() => setSkill(s.id)} style={{ textAlign: "left", padding: "12px 12px", borderRadius: 10, border: sel ? "2px solid var(--sup-teal)" : "1.5px solid var(--border-2)", background: sel ? "var(--teal-50)" : "#fff", cursor: "pointer", fontFamily: "var(--font-kanit)", transition: "all 180ms var(--ease-out)" }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: "var(--fg-1)", whiteSpace: "nowrap" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", fontWeight: 300, marginTop: 4, lineHeight: 1.35 }}>{s.note}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label>น้ำหนัก (จัดบอร์ดให้พอดี) — ไม่ระบุก็ได้</Label>
        <div style={{ padding: "12px 14px", background: "var(--sand-50)", borderRadius: 10, border: "1.5px solid var(--border-2)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 24, fontWeight: 700, color: "var(--fg-1)" }}>{weight}<span style={{ fontSize: 13, color: "var(--fg-3)", marginLeft: 4 }}>kg</span></span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--sup-teal)", whiteSpace: "nowrap" }}>{getBoardName(weight)}</span>
          </div>
          <input type="range" min={40} max={120} value={weight} onChange={(e) => setWeight(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--sup-teal)" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Contact ──────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-kanit)", fontSize: 15, padding: "11px 13px",
  borderRadius: 8, border: "1.5px solid var(--border-2)",
  background: "#fff", color: "var(--fg-1)", outline: "none", width: "100%",
};
const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: "var(--danger)" };

function StepContact({ name, setName, phone, setPhone, contactChannel, setContactChannel, contactId, setContactId, pickupAddress, setPickupAddress, notes, setNotes, photoPermission, setPhotoPermission, paddlers, summary, fieldErrors }: {
  name: string; setName: (s: string) => void;
  phone: string; setPhone: (s: string) => void;
  contactChannel: ContactChannel; setContactChannel: (c: ContactChannel) => void;
  contactId: string; setContactId: (s: string) => void;
  pickupAddress: string; setPickupAddress: (s: string) => void;
  notes: string; setNotes: (s: string) => void;
  photoPermission: PhotoPermission; setPhotoPermission: (p: PhotoPermission) => void;
  paddlers: number;
  fieldErrors: { name?: string; phone?: string };
  summary: { date: string; timeSlot: { label: string; time: string }; route: { name: string; price: number }; paddlers: number; skill: SkillLevel; photoPermission: PhotoPermission; baseTotal: number; photoTotal: number; total: number; };
}) {
  const canPrivate = paddlers >= 2;
  const skillLabel = SKILLS.find((s) => s.id === summary.skill)?.label ?? "";
  const photoLabel = PHOTO_OPTIONS.find((p) => p.id === summary.photoPermission)?.label ?? "";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* Contact fields */}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: fieldErrors.name ? "var(--danger)" : "var(--fg-2)" }}>
          ชื่อผู้จอง <span style={{ color: "var(--danger)" }}>*</span>
        </span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="มะลิ สุวรรณภา" style={fieldErrors.name ? inputErrorStyle : inputStyle} />
        {fieldErrors.name && <span style={{ fontSize: 11, color: "var(--danger)", fontWeight: 500 }}>⚠ {fieldErrors.name}</span>}
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: fieldErrors.phone ? "var(--danger)" : "var(--fg-2)" }}>
          เบอร์โทร <span style={{ color: "var(--danger)" }}>*</span>
        </span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="083 714 6958" style={fieldErrors.phone ? inputErrorStyle : inputStyle} />
        {fieldErrors.phone && <span style={{ fontSize: 11, color: "var(--danger)", fontWeight: 500 }}>⚠ {fieldErrors.phone}</span>}
      </label>

      {/* Contact channel */}
      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)" }}>
          ช่องทางติดต่อ <span style={{ fontWeight: 300, color: "var(--fg-4)" }}>(ไม่บังคับ)</span>
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {CONTACT_CHANNELS.map((ch) => {
            const sel = contactChannel === ch.id;
            return (
              <button key={ch.id} onClick={() => setContactChannel(ch.id)}
                style={{
                  padding: "10px 6px", borderRadius: 10, cursor: "pointer",
                  border: sel ? "2px solid var(--sup-teal)" : "1.5px solid var(--border-2)",
                  background: sel ? "var(--teal-50)" : "#fff",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  fontFamily: "var(--font-kanit)", transition: "all 180ms var(--ease-out)",
                }}>
                <span style={{ fontSize: 18 }}>{ch.icon}</span>
                <span style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? "var(--sup-teal)" : "var(--fg-2)", whiteSpace: "nowrap" }}>{ch.label}</span>
              </button>
            );
          })}
        </div>
        <input
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
          placeholder={CONTACT_CHANNELS.find((c) => c.id === contactChannel)?.placeholder ?? ""}
          style={inputStyle}
        />
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)" }}>
          ที่อยู่รับ-ส่ง{" "}
          <span style={{ fontWeight: 300, color: "var(--fg-4)" }}>(ถ้าต้องการบริการ · ใน 5 กม ฟรี)</span>
        </span>
        <input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="บ้านเลขที่ / ชื่อโรงแรม / สถานที่" style={inputStyle} />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)" }}>หมายเหตุเพิ่มเติม</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="เช่น มีเด็กเล็ก มีผู้สูงอายุ ความต้องการพิเศษ ฯลฯ" style={{ ...inputStyle, resize: "vertical", minHeight: 68 }} />
      </label>

      {/* Photo permission */}
      <div>
        <Label>การถ่ายภาพ</Label>
        <div style={{ padding: "10px 14px", background: "var(--teal-50)", borderRadius: 8, fontSize: 12, color: "var(--teal-700)", lineHeight: 1.65, marginBottom: 10 }}>
          <strong style={{ fontWeight: 600 }}>ℹ การอนุญาตถ่ายภาพ — </strong>
          การอนุญาตหมายถึงให้สิทธิ์กับทาง Sup Space Maeklong นำภาพไปเผยแพร่ในสื่อ social ได้ และลูกค้าจะได้รับภาพที่ถ่ายเป็นที่ระลึก
          แต่ถ้าลูกค้าไม่ต้องการให้เผยแพร่ภาพในสื่อแต่ต้องการรูป สามารถเลือกเป็น <strong style={{ fontWeight: 600 }}>Private</strong> ได้ โดยมีค่าใช้จ่าย 500 บาท
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {PHOTO_OPTIONS.map((opt) => {
            const disabled = opt.id === "private" && !canPrivate;
            const sel = photoPermission === opt.id;
            return (
              <button key={opt.id} onClick={() => !disabled && setPhotoPermission(opt.id)} disabled={disabled}
                style={{ textAlign: "left", padding: "12px 12px", borderRadius: 10, border: sel ? "2px solid var(--sup-orange)" : "1.5px solid var(--border-2)", background: sel ? "#FFF4E5" : "#fff", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "var(--font-kanit)", transition: "all 180ms var(--ease-out)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: sel ? "var(--orange-700)" : "var(--fg-1)" }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: "var(--fg-2)", fontWeight: 300, marginTop: 4, lineHeight: 1.35 }}>{opt.sub}</div>
                {opt.badge && (
                  <div style={{ fontSize: 11, color: sel ? "var(--sup-orange)" : "var(--fg-3)", fontWeight: 500, marginTop: 4 }}>
                    {disabled ? "ต้องมีอย่างน้อย 2 คน" : opt.badge}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking summary */}
      <div style={{ background: "var(--sand-50)", borderRadius: 10, padding: 14, border: "1px solid var(--border-1)" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 600, color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>สรุปการจอง</div>
        <Row k="วันที่" v={summary.date} />
        <Row k="รอบ" v={`${summary.timeSlot.label} · ${summary.timeSlot.time.split("–")[0].trim()}`} />
        <Row k="เส้นทาง" v={summary.route.name} />
        <Row k="ผู้พาย" v={`${summary.paddlers} บอร์ด · ${skillLabel}`} />
        <Row k="ถ่ายภาพ" v={photoLabel} />
        <div style={{ borderTop: "1px dashed var(--border-2)", margin: "6px 0" }} />
        <Row k={`ค่าทัวร์ (฿${summary.route.price}×${summary.paddlers})`} v={`฿${summary.baseTotal.toLocaleString()}`} muted />
        {summary.photoTotal > 0 && <Row k={`Private photo (฿${PRIVATE_PHOTO_PRICE}×${summary.paddlers})`} v={`+฿${summary.photoTotal.toLocaleString()}`} muted />}
        <div style={{ borderTop: "1px dashed var(--border-2)", margin: "6px 0" }} />
        <Row k="รวมทั้งหมด" v={`฿${summary.total.toLocaleString()}`} big />
      </div>
    </div>
  );
}

// ─── Confirmed state ──────────────────────────────────────────────────────────

function ConfirmedState({ date, timeSlot, route, paddlers, name, photoPermission, total, bookingId, joinHost, onReset }: {
  date: string; timeSlot: { label: string }; route: { name: string };
  paddlers: number; name: string; photoPermission: PhotoPermission;
  total: number; bookingId: string; joinHost: string | null; onReset: () => void;
}) {
  const photoLabel = PHOTO_OPTIONS.find((p) => p.id === photoPermission)?.label ?? "";
  const refId = bookingId ? bookingId.slice(-8).toUpperCase() : "—";

  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ width: 76, height: 76, borderRadius: 999, background: "var(--success-soft)", color: "var(--success)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 800, animation: "pop 480ms cubic-bezier(0.34,1.56,0.64,1)" }}>✓</div>
      <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 32, color: "var(--sup-teal)", lineHeight: 1.15, marginTop: 16 }}>
        {joinHost ? `ร่วมทริปกับ ${joinHost} แล้ว!` : "เจอกันที่แม่กลอง!"}
      </div>

      {/* Booking reference */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, padding: "8px 18px", background: "var(--sand-50)", borderRadius: 999, border: "1px solid var(--border-2)" }}>
        <span style={{ fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--fg-3)" }}>หมายเลขจอง</span>
        <span style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 16, color: "var(--fg-1)", letterSpacing: "0.08em" }}>#{refId}</span>
      </div>

      <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 15, color: "var(--fg-2)", maxWidth: 420, margin: "14px auto 8px", lineHeight: 1.6 }}>
        ขอบคุณ <strong style={{ color: "var(--fg-1)", fontWeight: 500 }}>{name || "คุณ"}</strong> · {paddlers} บอร์ด
        {" "}เส้นทาง<strong style={{ color: "var(--fg-1)", fontWeight: 500 }}>{route.name}</strong>
        {" "}· {timeSlot.label} {date} · ถ่ายภาพ: {photoLabel}
      </p>
      <div style={{ padding: "10px 16px", background: "var(--teal-50)", borderRadius: 10, fontSize: 13, color: "var(--teal-700)", fontWeight: 400, margin: "0 auto 18px", maxWidth: 380 }}>
        ทีมเราจะติดต่อยืนยันผ่าน LINE ภายใน 1 ชั่วโมง 🎉
      </div>

      <div style={{ fontFamily: "var(--font-inter)", fontSize: 24, fontWeight: 700, color: "var(--fg-1)", marginBottom: 20 }}>฿{total.toLocaleString()}</div>
      <button onClick={onReset} className="btn btn-secondary">{joinHost ? "ร่วมทริปอื่น" : "จองอีก"}</button>
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: 26, boxShadow: "var(--shadow-xl)",
  border: "1px solid var(--border-1)", width: "100%", maxWidth: 540,
  position: "relative", fontFamily: "var(--font-kanit)",
};

interface BookingWidgetProps {
  joinTrip?: UpcomingTrip | null;
  onClearJoin?: () => void;
}

export default function BookingWidget({ joinTrip: joinTripProp, onClearJoin }: BookingWidgetProps) {
  // Availability
  const [availability, setAvailability] = useState<AvailDay[]>([]);
  const [availLoading, setAvailLoading] = useState(true);
  const [weekOffset, setWeekOffset]     = useState(0);

  // Pre-select today immediately (updated to first available day after load)
  const [dateIso, setDateIso] = useState(() => toIso(new Date()));
  const [date, setDate]       = useState(() => isoToLabel(toIso(new Date())));

  const [timeSlot, setTimeSlot]             = useState<TimeSlotId>("MORNING");
  const [route, setRoute]                   = useState("phoprak");
  const [routeCat, setRouteCat]             = useState<RouteCategory>("short");
  const [paddlers, setPaddlers]             = useState(2);
  const [skill, setSkill]                   = useState<SkillLevel>("BEGINNER");
  const [weight, setWeight]                 = useState(65);
  const [photoPermission, setPhotoPermission] = useState<PhotoPermission>("allow");
  const [name, setName]                     = useState("");
  const [phone, setPhone]                   = useState("");
  const [pickupAddress, setPickupAddress]   = useState("");
  const [notes, setNotes]                   = useState("");
  const [step, setStep]                     = useState(0);
  const [confirmed, setConfirmed]           = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [bookingId, setBookingId]           = useState("");
  const [contactChannel, setContactChannel] = useState<ContactChannel>("line");
  const [contactId, setContactId]           = useState("");

  // Validation
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitError, setSubmitError] = useState("");

  // Load availability on mount
  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.ok ? r.json() : null)
      .then((data: AvailDay[] | null) => {
        if (data?.length) {
          setAvailability(data);
          const first = data.find((d) => d.available);
          if (first) {
            setDateIso(first.date);
            setDate(isoToLabel(first.date));
            if (!first.morning) setTimeSlot("AFTERNOON");
          }
        }
      })
      .catch(() => {}) // keep today's date already set
      .finally(() => setAvailLoading(false));
  }, []);

  // Pre-fill when joining a trip
  useEffect(() => {
    if (!joinTripProp) return;
    setDate(joinTripProp.date);
    setDateIso(joinTripProp.dateKey);  // dateKey holds the ISO date "2026-05-23"
    setTimeSlot(joinTripProp.timeSlot);
    setRoute(joinTripProp.routeId);
    const r = ROUTES.find((x) => x.id === joinTripProp.routeId);
    if (r) setRouteCat(r.cat);
    setStep(3);
    setConfirmed(false);
  }, [joinTripProp]);

  const handleDateSelect = (iso: string) => {
    setDateIso(iso);
    setDate(isoToLabel(iso));
    const avail = availability.find((a) => a.date === iso);
    if (avail && !avail.morning && timeSlot === "MORNING") setTimeSlot("AFTERNOON");
    if (avail && !avail.afternoon && timeSlot === "AFTERNOON") setTimeSlot("MORNING");
  };

  const isJoin = !!joinTripProp;
  const selectedRoute = ROUTES_BY_ID[route] ?? ROUTES[0];
  const photoTotal = photoPermission === "private" && paddlers >= 2 ? PRIVATE_PHOTO_PRICE * paddlers : 0;
  const baseTotal = selectedRoute.price * paddlers;
  const total = baseTotal + photoTotal;
  const selectedTimeSlot = TIMESLOTS.find((t) => t.id === timeSlot)!;
  const stepNames = ["วัน", "รอบ", "เส้นทาง", "ผู้พาย", "ติดต่อ"];

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, isJoin ? 3 : 0));

  const validate = () => {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = "กรุณากรอกชื่อผู้จอง";
    if (!phone.trim()) errs.phone = "กรุณากรอกเบอร์โทรหรือ LINE ID";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError("");
    setSubmitting(true);
    const result = await createBooking({
      date, dateIso, timeSlot, routeId: route,
      paddlers, weight, skillLevel: skill,
      photoPermission, total,
      guestName: name, guestPhone: phone,
      contactChannel: contactId ? contactChannel : undefined,
      contactId: contactId || undefined,
      pickupAddress: pickupAddress || undefined,
      notes: notes || undefined,
    });
    setSubmitting(false);
    if (result.ok) {
      setBookingId(result.id ?? "");
      setConfirmed(true);
    } else {
      setSubmitError(result.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  const handleReset = () => { setConfirmed(false); setStep(0); setFieldErrors({}); setSubmitError(""); setContactChannel("line"); setContactId(""); onClearJoin?.(); };

  if (confirmed) {
    return (
      <div id="book" style={cardStyle}>
        <ConfirmedState date={date} timeSlot={selectedTimeSlot} route={selectedRoute} paddlers={paddlers} name={name} photoPermission={photoPermission} total={total} bookingId={bookingId} joinHost={joinTripProp?.host ?? null} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div id="book" style={cardStyle}>
      {/* JOIN-mode banner */}
      {isJoin && joinTripProp && (
        <div style={{ margin: "-26px -26px 18px", padding: "12px 22px", background: "var(--sup-teal)", color: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: "rgba(255,255,255,0.22)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>↗</span>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 14, minWidth: 0 }}>
              <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>กำลังร่วมทริปของ {joinTripProp.host}</span>
              <span style={{ fontWeight: 300, fontSize: 12, opacity: 0.82, marginLeft: 8, whiteSpace: "nowrap" }}>· {joinTripProp.joined}/{joinTripProp.max} บอร์ด</span>
            </div>
          </div>
          <button onClick={onClearJoin} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 999, padding: "4px 12px", fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>เริ่มทริปใหม่</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">จองง่ายใน 30 วินาที</div>
          <div style={{ fontFamily: "var(--font-kanit)", fontSize: 24, fontWeight: 700, color: "var(--fg-1)", marginTop: 4, lineHeight: 1.15, letterSpacing: "-0.01em" }}>จองทริปพายซับ</div>
          <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>ยกเลิกฟรี · จ่ายหน้างาน · รวมถ่ายภาพ</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: 22, color: "var(--sup-teal)", lineHeight: 1, whiteSpace: "nowrap" }}>฿{selectedRoute.price.toLocaleString()}</div>
          <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "var(--fg-3)", marginTop: 2, whiteSpace: "nowrap" }}>/ บอร์ด</div>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {stepNames.map((label, i) => {
          const locked = isJoin && i < 3;
          return (
            <div key={label} style={{ flex: 1, opacity: locked ? 0.55 : 1 }}>
              <div style={{ height: 5, borderRadius: 999, background: locked ? "var(--sup-teal)" : (i <= step ? "var(--sup-orange)" : "var(--sand-200)"), transition: "background 240ms var(--ease-out)" }} />
              <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, marginTop: 6, color: locked ? "var(--sup-teal)" : (i === step ? "var(--sup-orange)" : (i < step ? "var(--fg-2)" : "var(--fg-4)")), whiteSpace: "nowrap" }}>
                {locked ? "🔒" : `${i + 1}.`} {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div style={{ minHeight: 300 }}>
        {step === 0 && <StepWhen dateIso={dateIso} onSelect={handleDateSelect} availability={availability} loading={availLoading} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />}
        {step === 1 && <StepTime timeSlot={timeSlot} setTimeSlot={setTimeSlot} availability={availability} dateIso={dateIso} />}
        {step === 2 && <StepRoute route={route} setRoute={setRoute} routeCat={routeCat} setRouteCat={setRouteCat} />}
        {step === 3 && <StepPaddlers paddlers={paddlers} setPaddlers={setPaddlers} skill={skill} setSkill={setSkill} weight={weight} setWeight={setWeight} />}
        {step === 4 && (
          <StepContact
            name={name} setName={(v) => { setName(v); setFieldErrors((e) => ({ ...e, name: undefined })); }}
            phone={phone} setPhone={(v) => { setPhone(v); setFieldErrors((e) => ({ ...e, phone: undefined })); }}
            contactChannel={contactChannel} setContactChannel={setContactChannel}
            contactId={contactId} setContactId={setContactId}
            pickupAddress={pickupAddress} setPickupAddress={setPickupAddress}
            notes={notes} setNotes={setNotes}
            photoPermission={photoPermission} setPhotoPermission={setPhotoPermission}
            paddlers={paddlers}
            fieldErrors={fieldErrors}
            summary={{ date, timeSlot: selectedTimeSlot, route: selectedRoute, paddlers, skill, photoPermission, baseTotal, photoTotal, total }}
          />
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div style={{ margin: "12px 0 0", padding: "10px 14px", background: "#FFF1F0", borderRadius: 8, fontSize: 13, color: "var(--danger)", fontWeight: 500 }}>
          ⚠ {submitError}
        </div>
      )}

      {/* Navigation */}
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button onClick={prev} disabled={step === 0 || (isJoin && step <= 3)} className="btn btn-ghost" style={{ opacity: step === 0 || (isJoin && step <= 3) ? 0.35 : 1 }}>← ย้อน</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {step >= 2 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "var(--fg-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>รวม</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 20, fontWeight: 700, color: "var(--fg-1)", whiteSpace: "nowrap" }}>฿{total.toLocaleString()}</div>
            </div>
          )}
          {step < 4 ? (
            <button onClick={next} className="btn btn-primary" style={{ padding: "13px 22px" }}>ต่อไป →</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ padding: "13px 26px", boxShadow: "var(--shadow-glow-orange), 0 0 0 4px rgba(255,140,0,0.18)", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "กำลังส่ง..." : (isJoin ? "ร่วมทริปเลย" : "ยืนยันการจอง")}
            </button>
          )}
        </div>
      </div>

      {/* Trust chips */}
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-1)", display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12, color: "var(--fg-2)", fontWeight: 400 }}>
        <TrustChip label="ยกเลิกฟรี 24 ชม." />
        <TrustChip label="ไม่ต้องใช้บัตรเครดิต" />
        <TrustChip label="จ่ายหน้างาน" />
        <TrustChip label="ภาษาไทย & EN" />
      </div>
    </div>
  );
}
