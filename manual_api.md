# SUP Space Maeklong — API Manual

Base URL: `https://supspacemaeklong.com` (หรือ `http://localhost:3000` สำหรับ local)

---

## Public APIs

### GET /api/routes

ดึงข้อมูลเส้นทาง SUP ทั้งหมดและหมวดหมู่

**Query params:** ไม่มี

**Cache:** `public, max-age=60, stale-while-revalidate=300`

**Response:**
```json
{
  "routes": [
    {
      "id": "phoprak",
      "cat": "short",
      "name": "ร้านกาแฟภพรัก",
      "note": "พายเข้าคลองเม้ง · สวนมะพร้าว · กาแฟพิเศษ",
      "km": 3,
      "price": 500,
      "duration": 2,
      "recommend": true
    }
  ],
  "categories": [
    {
      "id": "short",
      "label": "สั้น",
      "sub": "~2 ชม · 2-4 กม",
      "skill": "มือใหม่ก็พายได้"
    },
    {
      "id": "medium",
      "label": "กลาง",
      "sub": "3-4 ชม · 6-12 กม",
      "skill": "เคยพายมาก่อน"
    },
    {
      "id": "long",
      "label": "ไกล",
      "sub": "ครึ่งวัน · 16-25 กม",
      "skill": "พายเชี่ยวชาญ"
    }
  ]
}
```

**Fields — route:**

| Field | Type | Description |
|---|---|---|
| `id` | string | route identifier ใช้อ้างอิงใน booking |
| `cat` | `"short"` \| `"medium"` \| `"long"` | หมวดหมู่ |
| `name` | string | ชื่อเส้นทาง |
| `note` | string | คำอธิบายสั้น |
| `km` | number | ระยะทาง (กม) |
| `price` | number | ราคาต่อบอร์ด (บาท) |
| `duration` | number | ระยะเวลาทริป (ชั่วโมง) |
| `recommend` | boolean? | เส้นทางแนะนำ (ไม่มีถ้า false) |

---

### GET /api/upcoming-trips

ดึงทริปที่กำลังจะมาทั้งหมด — ทั้งทริปปกติ (จากการจอง CONFIRMED) และ Special Trips (จาก admin)

**Query params:** ไม่มี

**Cache:** `public, max-age=60` (1 นาที)

**Response:** Array เรียงตาม `dateKey` → `timeSlot`

```json
[
  {
    "id": "2026-06-21|09:00|phoprak",
    "type": "regular",
    "date": "อา. 21 มิ.ย.",
    "dateKey": "2026-06-21",
    "day": "อาทิตย์",
    "timeSlot": "09:00",
    "routeId": "phoprak",
    "route": {
      "id": "phoprak",
      "cat": "short",
      "name": "ร้านกาแฟภพรัก",
      "note": "พายเข้าคลองเม้ง · สวนมะพร้าว · กาแฟพิเศษ",
      "km": 3,
      "price": 500,
      "duration": 2,
      "recommend": true
    },
    "joined": 3,
    "max": 8,
    "closed": false,
    "host": "มะลิ"
  },
  {
    "id": "special|abc123",
    "type": "special",
    "date": "ส. 27 มิ.ย.",
    "dateKey": "2026-06-27",
    "day": "เสาร์",
    "timeSlot": "08:00",
    "name": "ทริปพิเศษท่าคา",
    "description": "ล่องคลองบ้านใต้ · ตลาดน้ำโบราณ",
    "location": "ท่าคา",
    "rentalPrice": 1200,
    "ownBoardPrice": 800,
    "coverPhoto": "/uploads/abc123.jpg",
    "joined": 4,
    "max": 12,
    "closed": true
  }
]
```

**Fields — regular trip:**

| Field | Type | Description |
|---|---|---|
| `id` | string | `"dateKey\|timeSlot\|routeId"` |
| `type` | `"regular"` | ประเภท |
| `date` | string | วันที่แบบไทย เช่น `"ส. 21 มิ.ย."` |
| `dateKey` | string | ISO date `"YYYY-MM-DD"` |
| `day` | string | ชื่อวันแบบเต็ม เช่น `"เสาร์"` |
| `timeSlot` | string | เวลาเริ่ม เช่น `"09:00"` |
| `routeId` | string | route id |
| `route` | object | ข้อมูลเส้นทางเต็ม (เหมือน `/api/routes`) |
| `joined` | number | จำนวนบอร์ดที่จองแล้ว |
| `max` | number | ความจุสูงสุด |
| `host` | string | ชื่อผู้จองคนแรก |
| `closed` | boolean | `true` เมื่อ Admin ปิดรับผู้ร่วมเพิ่ม; UI แสดงเป็น “เต็ม” |

**Fields — special trip:**

| Field | Type | Description |
|---|---|---|
| `id` | string | `"special\|{id}"` |
| `type` | `"special"` | ประเภท |
| `date` | string | วันที่แบบไทย |
| `dateKey` | string | ISO date |
| `day` | string | ชื่อวันแบบเต็ม |
| `timeSlot` | string | เวลาเริ่ม |
| `name` | string | ชื่อ special trip |
| `description` | string \| null | คำอธิบาย |
| `location` | string | สถานที่ |
| `rentalPrice` | number | ราคาเช่าบอร์ด (บาท) |
| `ownBoardPrice` | number | ราคานำบอร์ดมาเอง (บาท) |
| `coverPhoto` | string \| null | path รูป cover |
| `joined` | number | จำนวนบอร์ดที่จองแล้ว |
| `max` | number | ความจุสูงสุด |
| `closed` | boolean | `true` เมื่อ Admin ปิดรับผู้ร่วมเพิ่ม; UI แสดงเป็น “เต็ม” |

---

### GET /api/availability

เช็คช่วงเวลาที่ว่างสำหรับการจอง

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `start` | `YYYY-MM-DD` | วันนี้ | วันเริ่มต้น (ไม่ย้อนหลัง) |
| `days` | number | `14` | จำนวนวัน (min 1, max 92) |

**Cache:** `public, max-age=60` (1 นาที)

**ตัวอย่าง:**
```
GET /api/availability?start=2026-06-21&days=7
```

**Response:** Array ของแต่ละวัน
```json
[
  {
    "date": "2026-06-21",
    "hours": {
      "07:00": true,
      "08:00": false,
      "09:00": true,
      "10:00": true,
      "11:00": false,
      "12:00": true,
      "13:00": true,
      "14:00": true,
      "15:00": true,
      "16:00": true,
      "17:00": true
    },
    "available": true
  }
]
```

**Fields:**

| Field | Type | Description |
|---|---|---|
| `date` | string | ISO date `"YYYY-MM-DD"` |
| `hours` | object | key = time slot, value = `true` (ว่าง) / `false` (ไม่ว่าง) |
| `available` | boolean | `true` ถ้ามีอย่างน้อย 1 ช่วงเวลาที่ว่าง |

**หมายเหตุ:** `false` หมายถึงปิดโดย admin หรือมีการจองที่ทับซ้อน (คำนึงถึง `duration` ของ route)

---

### POST /api/booking

สร้างการจองจากระบบภายนอก เช่น AI chatbot โดยใช้ booking logic เดียวกับฟอร์มบนเว็บไซต์

**เปิดใช้งาน:** ต้องตั้ง `BOOKING_API_KEY` ถ้าไม่ตั้ง endpoint จะตอบ `503`

**Auth:**

```http
Authorization: Bearer <BOOKING_API_KEY>
Content-Type: application/json
```

**Body — regular trip:**

```json
{
  "dateIso": "2026-08-10",
  "timeSlot": "09:00",
  "routeId": "phoprak",
  "paddlers": 2,
  "guestName": "สมชาย ใจดี",
  "guestPhone": "0812345678",
  "guestEmail": "somchai@example.com",
  "lineUserId": "U1234567890",
  "notes": "มือใหม่"
}
```

**Body — special trip:**

```json
{
  "dateIso": "2026-08-15",
  "timeSlot": "08:00",
  "specialTripId": "cm123abc",
  "boardChoice": "rental",
  "paddlers": 1,
  "guestName": "สมชาย ใจดี",
  "guestPhone": "0812345678"
}
```

| Field | Type | Required | Description |
|---|---|---:|---|
| `dateIso` | `YYYY-MM-DD` | ✓ | ห้ามเป็นวันที่ย้อนหลัง |
| `timeSlot` | string | ✓ | เวลาเริ่ม เช่น `09:00` |
| `routeId` | string | regular | ID เส้นทางที่มีใน `PaddleRoute` |
| `specialTripId` | string | special | ID ของ Special Trip สถานะ `ACTIVE` |
| `boardChoice` | `"rental"` \| `"own"` | special | ถ้าไม่ใช่ `own` โค้ดปัจจุบันจะคิดราคาแบบเช่า |
| `paddlers` | integer | ✓ | 1–20 |
| `guestName` | string | ✓ | ชื่อลูกค้า |
| `guestPhone` | string | ✓ | เบอร์โทร; API ปัจจุบันยังไม่ normalize รูปแบบ |
| `guestEmail` | string | — | ถ้ามีและตั้ง Resend จะส่ง email รับการจอง |
| `lineUserId` | string | — | บันทึกเป็น `contactId` โดยใช้ channel `line` |
| `notes` | string | — | หมายเหตุ |

ราคาจะคำนวณจากฐานข้อมูล ไม่รับยอดเงินจาก client การสร้างรายการใช้ guard เดียวกับหน้าเว็บ: ทริปไม่ได้ถูก Admin ปิดรับเพิ่ม, duplicate, closed slot และ duration overlap สำหรับทริปปกติ

**Response — success (`201`):**

```json
{
  "ok": true,
  "bookingId": "cm123...",
  "ref": "AB12CD34",
  "status": "PENDING",
  "summary": {
    "date": "จันทร์ที่ 10 สิงหาคม 2569",
    "dateIso": "2026-08-10",
    "timeSlot": "09:00",
    "routeId": "phoprak",
    "specialTripId": null,
    "paddlers": 2,
    "total": 1000
  }
}
```

**ข้อจำกัดของ implementation ปัจจุบัน:** server-side writer ยังไม่บังคับ `maxBoards`, ไม่ตรวจว่า date/time ที่ส่งมาตรงกับ Special Trip และไม่บังคับ `timeSlot` ให้อยู่ในรายการ 07:00–17:00

---

## Admin APIs (ต้องล็อกอินก่อน)

API กลุ่มนี้ต้องส่ง cookie `admin_auth` (HMAC-SHA256 signed session token) ไปด้วยทุก request
ล็อกอินผ่าน `POST /api/admin/auth` เพื่อรับ cookie

---

### POST /api/admin/auth

ล็อกอิน admin — รับ session cookie กลับมา

**Body:**
```json
{ "password": "your-admin-password" }
```

**Response (success):**
```json
{ "ok": true }
```
พร้อม Set-Cookie: `admin_auth=<signed-token>`

**Response (fail):**
```json
{ "ok": false, "error": "รหัสผ่านไม่ถูกต้อง" }
```
Status: `401`

---

### DELETE /api/admin/auth

ล็อกเอาต์ — ลบ session cookie

**Response:**
```json
{ "ok": true }
```

---

### POST /api/admin/gallery

อัปโหลดรูปภาพเข้า gallery

**Auth:** ต้องการ `admin_auth` cookie

**Body:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✓ | รูปภาพ (JPEG / PNG / WebP, max 10MB) |
| `caption` | string | — | คำบรรยาย |
| `big` | `"true"` \| `"false"` | — | แสดงขนาดใหญ่ใน grid |
| `category` | string | — | หมวดหมู่ gallery |

**Response (success):**
```json
{
  "ok": true,
  "photo": {
    "id": "uuid",
    "src": "/uploads/filename.jpg",
    "caption": "คำบรรยาย",
    "big": false,
    "category": null,
    "order": 0
  }
}
```

---

### DELETE /api/admin/gallery/[id]

ลบรูปภาพจาก gallery (ลบไฟล์จาก disk ด้วย)

**Auth:** ต้องการ `admin_auth` cookie

**Response:**
```json
{ "ok": true }
```

---

### PATCH /api/admin/gallery/[id]

แก้ไข metadata ของรูปภาพ

**Auth:** ต้องการ `admin_auth` cookie

**Body:** (ส่งเฉพาะ field ที่ต้องการแก้ไข)
```json
{
  "caption": "คำบรรยายใหม่",
  "big": true,
  "category": "action"
}
```

**Response:**
```json
{ "ok": true }
```

---

### POST /api/admin/route-photo

อัปโหลดรูปสำหรับเส้นทาง (route cover photo)

**Auth:** ต้องการ `admin_auth` cookie

**Body:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✓ | รูปภาพ (JPEG / PNG / WebP, max 10MB) |

**Response:**
```json
{ "url": "/uploads/filename.jpg" }
```

---

### POST /api/admin/trip-photo

อัปโหลดรูป cover สำหรับ special trip

**Auth:** ต้องการ `admin_auth` cookie

**Body:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✓ | รูปภาพ (JPEG / PNG / WebP, max 10MB) |

**Response:**
```json
{ "url": "/uploads/filename.jpg" }
```

---

## Time Slots

ช่วงเวลาที่ระบบรองรับ (07:00 – 17:00 ทุก 1 ชั่วโมง):

```
"07:00", "08:00", "09:00", "10:00", "11:00",
"12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
```

Legacy values (รองรับย้อนหลัง แต่ไม่แนะนำสำหรับการจองใหม่):
- `"MORNING"` → รอบเช้า 07:00–11:00
- `"AFTERNOON"` → รอบบ่าย 13:00–17:00

---

## Error Responses

| Status | ความหมาย |
|---|---|
| `400` | Body หรือ params ไม่ถูกต้อง |
| `401` | ไม่ได้ล็อกอิน หรือรหัสผ่านผิด |
| `404` | ไม่พบ resource |
| `409` | สร้าง booking ไม่ได้เพราะชน business guard |
| `503` | Booking API ยังไม่เปิดเพราะไม่มี `BOOKING_API_KEY` |

---

## Other application endpoints

- `GET /api/uploads/[...path]` — อ่านรูปจาก `public/uploads`; cache 1 ปีแบบ immutable
- `POST /api/telegram` — Telegram membership webhook; ตรวจ secret header จาก config ในฐานข้อมูล
- `GET /api/debug-places` — ตรวจ Google Places configuration; ต้องมี admin session

Dance Challenge และ GoGreen ใช้ Next.js Server Actions ไม่ได้เปิดเป็น REST API ในไฟล์นี้
| `500` | เกิดข้อผิดพลาดฝั่ง server |
