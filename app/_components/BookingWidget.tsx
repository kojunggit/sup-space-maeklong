"use client";

import { useState, useEffect } from "react";
import {
  TIMESLOTS, ROUTES, CATEGORIES, SKILLS, DATES, ROUTES_BY_ID,
  PRIVATE_PHOTO_PRICE, type UpcomingTrip, type RouteCategory, type TimeSlotId, type SkillLevel,
} from "./trips-data";
import { createBooking } from "../actions/booking";

// ─── Shared sub-components ───────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-kanit)", fontSize: 13, fontWeight: 500, color: "var(--fg-2)", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function TrustChip({ label }: { label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-kanit)", fontWeight: 400, color: "var(--fg-2)", whiteSpace: "nowrap" }}>
      <span style={{
        width: 16, height: 16, borderRadius: 999,
        background: "var(--success-soft)", color: "var(--success)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 700, flexShrink: 0,
      }}>✓</span>
      {label}
    </span>
  );
}

function Stepper({ value, setValue, min, max }: { value: number; setValue: (v: number) => void; min: number; max: number }) {
  const btn: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 999,
    border: "1.5px solid var(--sup-teal)", background: "#fff", color: "var(--sup-teal)",
    fontSize: 20, fontWeight: 700, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
  };
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
      <span style={{
        fontFamily: big ? "var(--font-inter)" : "var(--font-kanit)",
        fontSize: big ? 22 : 14, fontWeight: big ? 700 : 500,
        color: muted ? "var(--fg-3)" : "var(--fg-1)", textAlign: "right", whiteSpace: "nowrap",
      }}>{v}</span>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepWhen({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  return (
    <div>
      <Label>เลือกวันที่</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {DATES.map((d) => {
          const key = `${d.d} ${d.n}`;
          const selected = date === key;
          return (
            <button key={key} onClick={() => setDate(key)} style={{
              padding: "12px 4px", borderRadius: 10,
              border: selected ? "2px solid var(--sup-orange)" : "1.5px solid var(--border-2)",
              background: selected ? "#FFF4E5" : "#fff",
              color: selected ? "var(--orange-700)" : "var(--fg-1)",
              cursor: "pointer", position: "relative",
              fontFamily: "var(--font-kanit)",
              transition: "all 180ms var(--ease-out)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}>{d.d}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 20, fontWeight: 700, marginTop: 2 }}>{d.n}</div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>{d.sub}</div>
              {d.hot && !selected && (
                <span style={{
                  position: "absolute", top: -6, right: -6,
                  background: "var(--sup-orange)", color: "#fff",
                  fontFamily: "var(--font-inter)", fontSize: 9, fontWeight: 700,
                  padding: "2px 6px", borderRadius: 999, letterSpacing: "0.06em",
                }}>HOT</span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--teal-50)", borderRadius: 8, fontSize: 13, color: "var(--teal-700)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>เคล็ดลับ —</span>
        <span>เสาร์เต็มเร็ว 3-4 วันล่วงหน้า · ยืนยันใน LINE ภายใน 1 ชม.</span>
      </div>
    </div>
  );
}

function StepTime({ timeSlot, setTimeSlot }: { timeSlot: TimeSlotId; setTimeSlot: (t: TimeSlotId) => void }) {
  return (
    <div>
      <Label>เลือกรอบ</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {TIMESLOTS.map((t) => {
          const selected = timeSlot === t.id;
          return (
            <button key={t.id} onClick={() => setTimeSlot(t.id)} style={{
              textAlign: "left", padding: "20px 18px", borderRadius: 12,
              border: selected ? "2px solid var(--sup-orange)" : "1.5px solid var(--border-2)",
              background: selected ? "#FFF4E5" : "#fff",
              cursor: "pointer", fontFamily: "var(--font-kanit)",
              transition: "all 180ms var(--ease-out)",
            }}>
              <div style={{ fontSize: 28, color: selected ? "var(--sup-orange)" : "var(--slate-300)", lineHeight: 1, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "var(--fg-1)", whiteSpace: "nowrap" }}>{t.label}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--fg-3)", marginTop: 2, whiteSpace: "nowrap" }}>{t.time}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "var(--fg-4)", marginTop: 2 }}>{t.en}</div>
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
          const selected = routeCat === c.id;
          return (
            <button key={c.id} onClick={() => setRouteCat(c.id as RouteCategory)} style={{
              padding: "8px 6px", borderRadius: 8, border: "none",
              background: selected ? "#fff" : "transparent",
              boxShadow: selected ? "var(--shadow-sm)" : "none",
              cursor: "pointer", fontFamily: "var(--font-kanit)",
              color: selected ? "var(--sup-teal)" : "var(--fg-2)",
              fontWeight: selected ? 700 : 500,
              transition: "all 160ms var(--ease-out)",
            }}>
              <div style={{ fontSize: 14, whiteSpace: "nowrap" }}>{c.label}</div>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 500, color: selected ? "var(--sup-teal)" : "var(--fg-3)", marginTop: 2, whiteSpace: "nowrap" }}>{c.sub}</div>
            </button>
          );
        })}
      </div>
      <div style={{ fontFamily: "var(--font-kanit)", fontSize: 12, color: "var(--sup-teal)", fontWeight: 500, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--sup-teal)", flexShrink: 0 }} />
        <span>เหมาะกับ: {catInfo.skill}</span>
      </div>
      <div style={{ display: "grid", gap: 8, maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
        {filtered.map((r) => {
          const selected = route === r.id;
          return (
            <button key={r.id} onClick={() => setRoute(r.id)} style={{
              textAlign: "left", padding: "11px 14px", borderRadius: 10,
              border: selected ? "2px solid var(--sup-orange)" : "1.5px solid var(--border-2)",
              background: selected ? "#FFF4E5" : "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
              fontFamily: "var(--font-kanit)",
              transition: "all 180ms var(--ease-out)",
            }}>
              <span style={{ width: 18, height: 18, borderRadius: 999, border: selected ? "6px solid var(--sup-orange)" : "2px solid var(--slate-300)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 500, fontSize: 15, color: "var(--fg-1)" }}>{r.name}</span>
                  {r.recommend && (
                    <span style={{ background: "var(--sup-orange)", color: "#fff", fontFamily: "var(--font-inter)", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>RECOMMEND</span>
                  )}
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

function getBoardName(w: number) {
  if (w < 60) return 'บอร์ด S (10\'4")';
  if (w < 85) return 'บอร์ด M (10\'8")';
  return 'บอร์ด L (11\'6")';
}

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
            const selected = skill === s.id;
            return (
              <button key={s.id} onClick={() => setSkill(s.id)} style={{
                textAlign: "left", padding: "12px 12px", borderRadius: 10,
                border: selected ? "2px solid var(--sup-teal)" : "1.5px solid var(--border-2)",
                background: selected ? "var(--teal-50)" : "#fff",
                cursor: "pointer", fontFamily: "var(--font-kanit)",
                transition: "all 180ms var(--ease-out)",
              }}>
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
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 24, fontWeight: 700, color: "var(--fg-1)" }}>
              {weight}<span style={{ fontSize: 13, color: "var(--fg-3)", marginLeft: 4 }}>kg</span>
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--sup-teal)", whiteSpace: "nowrap" }}>{getBoardName(weight)}</span>
          </div>
          <input
            type="range" min={40} max={120} value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--sup-teal)" }}
          />
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-kanit)", fontSize: 15,
  padding: "11px 13px", borderRadius: 8,
  border: "1.5px solid var(--border-2)",
  background: "#fff", color: "var(--fg-1)",
  outline: "none", width: "100%",
};

function StepContact({ name, setName, phone, setPhone, hasPhoto, setHasPhoto, photoEligible, summary }: {
  name: string; setName: (s: string) => void;
  phone: string; setPhone: (s: string) => void;
  hasPhoto: boolean; setHasPhoto: (b: boolean) => void;
  photoEligible: boolean;
  summary: {
    date: string; timeSlot: { label: string; time: string };
    route: { name: string; price: number };
    paddlers: number; skill: SkillLevel;
    hasPhoto: boolean; baseTotal: number; photoTotal: number; total: number;
  };
}) {
  const photoOn = hasPhoto && photoEligible;
  const skillLabel = SKILLS.find((s) => s.id === summary.skill)?.label ?? "";
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)", letterSpacing: "0.02em" }}>ชื่อ (ใช้ติดต่อ)</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="มะลิ สุวรรณภา" style={inputStyle} />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-2)", letterSpacing: "0.02em" }}>เบอร์โทร หรือ LINE ID</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="083 714 6958" style={inputStyle} />
      </label>

      <button
        onClick={() => photoEligible && setHasPhoto(!hasPhoto)}
        disabled={!photoEligible}
        style={{
          width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 10,
          border: photoOn ? "2px solid var(--sup-orange)" : "1.5px solid var(--border-2)",
          background: photoOn ? "#FFF4E5" : "#fff",
          cursor: photoEligible ? "pointer" : "not-allowed",
          opacity: photoEligible ? 1 : 0.6,
          display: "flex", alignItems: "center", gap: 12,
          fontFamily: "var(--font-kanit)",
          transition: "all 180ms var(--ease-out)",
        }}
      >
        <span style={{ width: 40, height: 22, borderRadius: 999, background: photoOn ? "var(--sup-orange)" : "var(--slate-300)", position: "relative", flexShrink: 0, transition: "background 180ms var(--ease-out)" }}>
          <span style={{ position: "absolute", top: 2, left: photoOn ? 20 : 2, width: 18, height: 18, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 180ms var(--ease-out)" }} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 500, fontSize: 15, color: "var(--fg-1)", whiteSpace: "nowrap" }}>ถ่ายภาพแบบ private</span>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "var(--fg-3)", whiteSpace: "nowrap" }}>+฿{PRIVATE_PHOTO_PRICE}/คน</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-2)", fontWeight: 300, marginTop: 2, lineHeight: 1.4 }}>
            {photoEligible ? "ไม่เผยแพร่ใน Social media · ส่งทาง LINE" : "ต้องมีอย่างน้อย 2 คน · ภาพประชาสัมพันธ์ฟรีอยู่แล้ว"}
          </div>
        </div>
      </button>

      <div style={{ background: "var(--sand-50)", borderRadius: 10, padding: 14, border: "1px solid var(--border-1)" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 600, color: "var(--sup-teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>สรุปการจอง</div>
        <Row k="วันที่" v={summary.date} />
        <Row k="รอบ" v={`${summary.timeSlot.label} · ${summary.timeSlot.time.split("–")[0].trim()}`} />
        <Row k="เส้นทาง" v={summary.route.name} />
        <Row k="ผู้พาย" v={`${summary.paddlers} บอร์ด · ${skillLabel}`} />
        <div style={{ borderTop: "1px dashed var(--border-2)", margin: "6px 0" }} />
        <Row k={`ค่าทัวร์ (฿${summary.route.price}×${summary.paddlers})`} v={`฿${summary.baseTotal.toLocaleString()}`} muted />
        {summary.hasPhoto && <Row k={`Private photo (฿${PRIVATE_PHOTO_PRICE}×${summary.paddlers})`} v={`+฿${summary.photoTotal.toLocaleString()}`} muted />}
        <div style={{ borderTop: "1px dashed var(--border-2)", margin: "6px 0" }} />
        <Row k="รวมทั้งหมด" v={`฿${summary.total.toLocaleString()}`} big />
      </div>
    </div>
  );
}

// ─── Confirmed state ──────────────────────────────────────────────────────────

function ConfirmedState({ date, timeSlot, route, paddlers, name, hasPhoto, total, joinHost, onReset }: {
  date: string; timeSlot: { label: string };
  route: { name: string }; paddlers: number; name: string;
  hasPhoto: boolean; total: number; joinHost: string | null;
  onReset: () => void;
}) {
  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{
        width: 76, height: 76, borderRadius: 999,
        background: "var(--success-soft)", color: "var(--success)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, fontWeight: 800,
        animation: "pop 480ms cubic-bezier(0.34,1.56,0.64,1)",
      }}>✓</div>
      <div style={{ fontFamily: "var(--font-kanit)", fontWeight: 700, fontSize: 34, color: "var(--sup-teal)", lineHeight: 1.15, marginTop: 16 }}>
        {joinHost ? `ร่วมทริปกับ ${joinHost} แล้ว!` : "เจอกันที่แม่กลอง!"}
      </div>
      <p style={{ fontFamily: "var(--font-kanit)", fontWeight: 300, fontSize: 16, color: "var(--fg-2)", maxWidth: 420, margin: "12px auto 8px" }}>
        ขอบคุณ {name || "คุณ"} · {paddlers} บอร์ดสำหรับเส้นทาง{" "}
        <strong style={{ color: "var(--fg-1)", fontWeight: 500 }}>{route.name}</strong>{" "}
        · {timeSlot.label}วัน {date}
        {hasPhoto && " · พร้อมถ่ายภาพ private"} · ทีมเราจะติดต่อใน LINE ภายใน 1 ชั่วโมง
      </p>
      <div style={{ fontFamily: "var(--font-inter)", fontSize: 22, fontWeight: 700, color: "var(--fg-1)", margin: "8px 0 22px" }}>
        ฿{total.toLocaleString()}
      </div>
      <button onClick={onReset} className="btn btn-secondary">{joinHost ? "ร่วมทริปอื่น" : "จองอีก"}</button>
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: 26,
  boxShadow: "var(--shadow-xl)", border: "1px solid var(--border-1)",
  width: "100%", maxWidth: 540, position: "relative",
  fontFamily: "var(--font-kanit)",
};

interface JoinTrip {
  id: string; date: string; timeSlot: TimeSlotId; routeId: string; joined: number; max: number; host: string;
}

interface BookingWidgetProps {
  joinTrip?: JoinTrip | null;
  onClearJoin?: () => void;
}

export default function BookingWidget({ joinTrip: joinTripProp, onClearJoin }: BookingWidgetProps) {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState("ส. 23");
  const [timeSlot, setTimeSlot] = useState<TimeSlotId>("MORNING");
  const [route, setRoute] = useState("phoprak");
  const [routeCat, setRouteCat] = useState<RouteCategory>("short");
  const [paddlers, setPaddlers] = useState(2);
  const [skill, setSkill] = useState<SkillLevel>("BEGINNER");
  const [weight, setWeight] = useState(65);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isJoin = !!joinTripProp;

  // When a joinTrip prop arrives, pre-fill the form
  useEffect(() => {
    if (!joinTripProp) return;
    setDate(joinTripProp.date.replace(" พ.ค.", "").replace(" มิ.ย.", "").trim());
    setTimeSlot(joinTripProp.timeSlot);
    setRoute(joinTripProp.routeId);
    const r = ROUTES.find((x) => x.id === joinTripProp.routeId);
    if (r) setRouteCat(r.cat);
    setStep(3);
    setConfirmed(false);
  }, [joinTripProp]);

  const selectedRoute = ROUTES_BY_ID[route] ?? ROUTES[0];
  const photoEligible = paddlers >= 2;
  const baseTotal = selectedRoute.price * paddlers;
  const photoTotal = hasPhoto && photoEligible ? PRIVATE_PHOTO_PRICE * paddlers : 0;
  const total = baseTotal + photoTotal;

  const stepNames = ["วัน", "รอบ", "เส้นทาง", "ผู้พาย", "ติดต่อ"];
  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, isJoin ? 3 : 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await createBooking({
      date, timeSlot, routeId: route,
      paddlers, weight, skillLevel: skill,
      hasPhoto: hasPhoto && photoEligible,
      total, guestName: name, guestPhone: phone,
    });
    setSubmitting(false);
    if (result.ok) setConfirmed(true);
  };

  const handleReset = () => {
    setConfirmed(false);
    setStep(0);
    onClearJoin?.();
  };

  const selectedTimeSlot = TIMESLOTS.find((t) => t.id === timeSlot)!;

  if (confirmed) {
    return (
      <div id="book" style={cardStyle}>
        <ConfirmedState
          date={date} timeSlot={selectedTimeSlot} route={selectedRoute}
          paddlers={paddlers} name={name}
          hasPhoto={hasPhoto && photoEligible} total={total}
          joinHost={joinTripProp?.host ?? null}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div id="book" style={cardStyle}>
      {/* JOIN-mode banner */}
      {isJoin && joinTripProp && (
        <div style={{
          margin: "-26px -26px 18px", padding: "12px 22px",
          background: "var(--sup-teal)", color: "#fff",
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: "rgba(255,255,255,0.22)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>↗</span>
            <div style={{ fontFamily: "var(--font-kanit)", fontSize: 14, minWidth: 0 }}>
              <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>กำลังร่วมทริปของ {joinTripProp.host}</span>
              <span style={{ fontWeight: 300, fontSize: 12, opacity: 0.82, marginLeft: 8, whiteSpace: "nowrap" }}>· {joinTripProp.joined}/{joinTripProp.max} บอร์ด</span>
            </div>
          </div>
          <button onClick={onClearJoin} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 999, padding: "4px 12px", fontFamily: "var(--font-kanit)", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            เริ่มทริปใหม่
          </button>
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
        {step === 0 && <StepWhen date={date} setDate={setDate} />}
        {step === 1 && <StepTime timeSlot={timeSlot} setTimeSlot={setTimeSlot} />}
        {step === 2 && <StepRoute route={route} setRoute={setRoute} routeCat={routeCat} setRouteCat={setRouteCat} />}
        {step === 3 && <StepPaddlers paddlers={paddlers} setPaddlers={setPaddlers} skill={skill} setSkill={setSkill} weight={weight} setWeight={setWeight} />}
        {step === 4 && (
          <StepContact
            name={name} setName={setName} phone={phone} setPhone={setPhone}
            hasPhoto={hasPhoto} setHasPhoto={setHasPhoto}
            photoEligible={photoEligible}
            summary={{ date, timeSlot: selectedTimeSlot, route: selectedRoute, paddlers, skill, hasPhoto: hasPhoto && photoEligible, baseTotal, photoTotal, total }}
          />
        )}
      </div>

      {/* Navigation */}
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button onClick={prev} disabled={step === 0 || (isJoin && step <= 3)} className="btn btn-ghost" style={{ opacity: step === 0 || (isJoin && step <= 3) ? 0.35 : 1 }}>
          ← ย้อน
        </button>
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
