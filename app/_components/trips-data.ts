export type RouteCategory = "short" | "medium" | "long";
export type TimeSlotId = string;   // "07:00"–"17:00" (new) or "MORNING"/"AFTERNOON" (legacy)
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "PRO";

/** Hourly time slots shown in the booking widget (07:00 – 17:00, every 1 h) */
export const TIME_SLOTS = [
  "07:00","08:00","09:00","10:00","11:00",
  "12:00","13:00","14:00","15:00","16:00","17:00",
] as const;

/** Minimal shape of an admin "closed slot" — shared by client & server */
export interface ClosedSlotShape {
  date:       string;   // ISO "2026-12-31"
  hour?:      string;   // legacy single hour "09:00"
  startHour?: string;   // range start "09:00"
  endHour?:   string;   // range end   "12:00"
}

/** True when the whole day is closed (no specific hour or range given) */
export function isDayClosed(slots: ClosedSlotShape[], date: string): boolean {
  return slots.some((s) => s.date === date && !s.hour && !s.startHour && !s.endHour);
}

/** True when a specific hour ("09:00") is closed on the given date */
export function isHourClosed(slots: ClosedSlotShape[], date: string, hour: string): boolean {
  return slots.some((s) => {
    if (s.date !== date) return false;
    if (!s.hour && !s.startHour && !s.endHour) return true;           // whole day
    if (s.hour) return s.hour === hour;                              // legacy single hour
    if (s.startHour && s.endHour) return hour >= s.startHour && hour <= s.endHour; // range
    if (s.startHour) return hour === s.startHour;
    return false;
  });
}

/** Display a raw timeSlot value (handles both legacy and new format) */
export function formatSlot(slot: string): string {
  if (slot === "MORNING")   return "รอบเช้า";
  if (slot === "AFTERNOON") return "รอบบ่าย";
  return `${slot} น.`;
}

export interface Route {
  id: string;
  cat: RouteCategory;
  name: string;
  note: string;
  km: number;
  price: number;
  duration: number;  // ระยะเวลาทริป (ชั่วโมง) — ใช้ block ช่วงเวลาที่ถัดมา
  recommend?: boolean;
}

export interface UpcomingTrip {
  id: string;
  date: string;        // Thai display "ส. 23 พ.ค."
  dateKey: string;     // ISO date "2026-05-23" — used to pre-fill the booking widget
  day: string;         // Full Thai day name "เสาร์"
  timeSlot: string;    // "09:00" (new) or "MORNING"/"AFTERNOON" (legacy)
  routeId: string;
  joined: number;
  max: number;
  host: string;
  closed?: boolean;      // admin ปิดรับผู้ร่วมทริปเพิ่ม (แสดงเป็น "เต็ม")
  // Special trip fields (only set when isSpecial = true)
  isSpecial?:            boolean;
  specialTripId?:        string;
  specialName?:          string;
  specialDescription?:   string;
  specialRentalPrice?:   number;
  specialOwnBoardPrice?: number;
  specialLocation?:      string;
  specialCoverPhoto?:    string;
}

export interface TimeSlot {
  id: TimeSlotId;
  label: string;
  en: string;
  time: string;
  icon: string;
}

export interface Skill {
  id: SkillLevel;
  label: string;
  note: string;
}

export interface DateOption {
  d: string;
  n: string;
  sub: string;
  hot?: boolean;
}

export const TIMESLOTS: TimeSlot[] = [
  { id: "MORNING",   label: "รอบเช้า",  en: "Morning",   time: "07:00 – 11:00", icon: "☀" },
  { id: "AFTERNOON", label: "รอบบ่าย",  en: "Afternoon", time: "13:00 – 17:00", icon: "◐" },
];

export const ROUTES: Route[] = [
  { id: "phoprak",     cat: "short",  name: "ร้านกาแฟภพรัก",             note: "พายเข้าคลองเม้ง · สวนมะพร้าว · กาแฟพิเศษ",        km: 3,  price: 500, duration: 2, recommend: true },
  { id: "pakhiao",     cat: "short",  name: "หอยทอดป้าเขียว",            note: "เลี้ยวขวาเข้าคลองเม้ง · ร้าน 40 ปี · กุ้งเผา",      km: 3,  price: 500, duration: 2, recommend: true },
  { id: "kaodrip",     cat: "short",  name: "ร้านกาแฟเก๋าจะดริป",         note: "เส้นทางสั้นๆ · บรรยากาศในสวน",                    km: 3,  price: 500, duration: 2 },
  { id: "prokcharoen", cat: "short",  name: "วัดปรกเจริญ + ให้อาหารปลา",  note: "เหมาะพาเด็กๆ · ไหว้พระ · ระยะสั้นชิลๆ",           km: 3,  price: 500, duration: 2 },
  { id: "rongsuan",    cat: "short",  name: "ตลาดนัดร่องสวนยายแพง",       note: "ของกินราคาน่ารัก · เปิดเสาร์-อาทิตย์เท่านั้น",      km: 3,  price: 500, duration: 2 },
  { id: "damnoenpwa",  cat: "short",  name: "ร้านอาหารดำเนินพวา",         note: "รอบเย็น · บรรยากาศโรแมนติก · กระแสน้ำแรง",        km: 4,  price: 500, duration: 2 },
  { id: "thaka",       cat: "medium", name: "ตลาดน้ำท่าคา",               note: "คลองบ้านใต้ · ตลาดน้ำโบราณ",                      km: 8,  price: 700, duration: 4, recommend: true },
  { id: "damnoen",     cat: "medium", name: "ตลาดน้ำดำเนินสะดวก",         note: "ตลาดน้ำในตำนาน · ออกก่อน 08.00 น.",               km: 6,  price: 700, duration: 3, recommend: true },
  { id: "bangnoi",     cat: "medium", name: "บางน้อย / Somdul Bee",       note: "ช่วงน้ำลง · ตลาดน้ำ + ผึ้ง + สะพานแขวน",          km: 7,  price: 750, duration: 4 },
  { id: "watyai",      cat: "medium", name: "สะพานแขวนวัดใหญ่",           note: "สะพานปลาทู · ล่องไปตามแม่น้ำแม่กลอง",             km: 8,  price: 700, duration: 4 },
  { id: "three-mkts",  cat: "long",   name: "ทริป 3 ตลาดน้ำ",             note: "อัมพวา + ท่าคา + บางน้อย · ผจญภัยครบรส",          km: 25, price: 900, duration: 6, recommend: true },
  { id: "bangruahak",  cat: "long",   name: "คลองบางเรือหัก",             note: "อุโมงป่าจาก · กระแสน้ำท้าทาย",                    km: 20, price: 900, duration: 5 },
  { id: "khaoyisarn",  cat: "long",   name: "เขายี่สาร — ข้าวใหม่ปลามัน", note: "วิถีคนเผาถ่าน · ทานริมน้ำ",                      km: 16, price: 900, duration: 5 },
];

export const ROUTES_BY_ID: Record<string, Route> = Object.fromEntries(
  ROUTES.map((r) => [r.id, r])
);

export const CATEGORIES = [
  { id: "short"  as RouteCategory, label: "สั้น",  sub: "~2 ชม · 2-4 กม",     skill: "มือใหม่ก็พายได้" },
  { id: "medium" as RouteCategory, label: "กลาง",  sub: "3-4 ชม · 6-12 กม",   skill: "เคยพายมาก่อน" },
  { id: "long"   as RouteCategory, label: "ไกล",   sub: "ครึ่งวัน · 16-25 กม", skill: "พายเชี่ยวชาญ" },
];

export const SKILLS: Skill[] = [
  { id: "BEGINNER",     label: "มือใหม่",   note: "ไม่เคยพาย หรือเคยไม่กี่ครั้ง" },
  { id: "INTERMEDIATE", label: "เคยพาย",    note: "พายได้เอง ทรงตัวคล่อง" },
  { id: "PRO",          label: "เชี่ยวชาญ", note: "พายเองได้ ไม่ต้องมีคนนำทาง" },
];

export const DATES: DateOption[] = [
  { d: "ศุ",  n: "22", sub: "พ.ค." },
  { d: "ส.",  n: "23", sub: "พ.ค.", hot: true },
  { d: "อา",  n: "24", sub: "พ.ค." },
  { d: "จ.",  n: "25", sub: "พ.ค." },
  { d: "อ.",  n: "26", sub: "พ.ค." },
  { d: "พ.",  n: "27", sub: "พ.ค." },
  { d: "พฤ", n: "28", sub: "พ.ค." },
];

export const UPCOMING_TRIPS: UpcomingTrip[] = [
  { id: "t-001", date: "ส. 23 พ.ค.",  dateKey: "2026-05-23", day: "เสาร์",   timeSlot: "MORNING",   routeId: "phoprak",     joined: 3, max: 8, host: "มะลิ" },
  { id: "t-002", date: "อา. 24 พ.ค.", dateKey: "2026-05-24", day: "อาทิตย์", timeSlot: "MORNING",   routeId: "damnoen",     joined: 5, max: 8, host: "Alex" },
  { id: "t-003", date: "อา. 24 พ.ค.", dateKey: "2026-05-24", day: "อาทิตย์", timeSlot: "AFTERNOON", routeId: "prokcharoen", joined: 2, max: 8, host: "พลอย" },
  { id: "t-004", date: "ส. 30 พ.ค.",  dateKey: "2026-05-30", day: "เสาร์",   timeSlot: "MORNING",   routeId: "three-mkts",  joined: 6, max: 8, host: "แก๊งวิ่ง" },
  { id: "t-005", date: "อา. 31 พ.ค.", dateKey: "2026-05-31", day: "อาทิตย์", timeSlot: "AFTERNOON", routeId: "pakhiao",     joined: 8, max: 8, host: "นิว" },
  { id: "t-006", date: "ส. 6 มิ.ย.",  dateKey: "2026-06-06", day: "เสาร์",   timeSlot: "MORNING",   routeId: "thaka",       joined: 1, max: 8, host: "June" },
];

export const PRIVATE_PHOTO_PRICE = 500;
