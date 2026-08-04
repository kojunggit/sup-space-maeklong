# Public API — Integration Quick Reference

Base URL: `https://supspacemaeklong.com`

รายละเอียด field และ Admin API ฉบับเต็มอยู่ใน `manual_api.md`

## Authentication

API สำหรับอ่านข้อมูลไม่ต้อง authenticate ส่วน `POST /api/booking` ต้องส่ง:

```http
Authorization: Bearer <BOOKING_API_KEY>
Content-Type: application/json
```

หาก server ไม่ได้ตั้ง `BOOKING_API_KEY` endpoint การจองจะปิดและตอบ `503`

## GET /api/routes

คืนค่าเส้นทางจากฐานข้อมูลและหมวดหมู่ `short`, `medium`, `long`

Cache: `public, max-age=60, stale-while-revalidate=300`

```json
{
  "routes": [
    {
      "id": "phoprak",
      "cat": "short",
      "name": "ร้านกาแฟภพรัก",
      "note": "พายเข้าคลองเม้ง · สวนมะพร้าว · กาแฟพิเศษ",
      "nameEn": "Phop Rak Café",
      "noteEn": "Canal, coconut gardens and specialty coffee",
      "descTh": "...",
      "descEn": "...",
      "warnTh": "",
      "warnEn": "",
      "km": 3,
      "price": 500,
      "duration": 2,
      "recommend": true,
      "photos": [],
      "order": 0
    }
  ],
  "categories": [
    { "id": "short", "label": "สั้น", "sub": "~2 ชม · 2-4 กม", "skill": "มือใหม่ก็พายได้" },
    { "id": "medium", "label": "กลาง", "sub": "3-4 ชม · 6-12 กม", "skill": "เคยพายมาก่อน" },
    { "id": "long", "label": "ไกล", "sub": "ครึ่งวัน · 16-25 กม", "skill": "พายเชี่ยวชาญ" }
  ]
}
```

## GET /api/upcoming-trips

คืนทริปปกติจาก booking สถานะ `CONFIRMED` และ Special Trip สถานะ `ACTIVE` เรียงตามวันที่และเวลา

Cache: `public, max-age=60`

```json
[
  {
    "id": "2026-08-10|09:00|phoprak",
    "type": "regular",
    "date": "จ. 10 ส.ค.",
    "dateKey": "2026-08-10",
    "day": "จันทร์",
    "timeSlot": "09:00",
    "routeId": "phoprak",
    "route": { "id": "phoprak", "name": "ร้านกาแฟภพรัก", "price": 500, "duration": 2 },
    "joined": 3,
    "max": 8,
    "closed": false,
    "host": "มะลิ"
  },
  {
    "id": "special|abc123",
    "type": "special",
    "date": "ส. 15 ส.ค.",
    "dateKey": "2026-08-15",
    "day": "เสาร์",
    "timeSlot": "08:00",
    "name": "ทริปพิเศษท่าคา",
    "description": "ล่องคลองบ้านใต้",
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

`closed: true` หมายถึง Admin ปิดรับผู้ร่วมเพิ่มสำหรับ private trip หน้าเว็บจะแสดง “เต็ม” และ Booking API จะปฏิเสธการจองทริปนั้น

## GET /api/availability?start=YYYY-MM-DD&days=14

- `start`: default วันนี้และไม่ยอมเริ่มย้อนหลัง
- `days`: default 14, min 1, max 92
- `true`: เปิดให้เลือก
- `false`: admin ปิดวัน/เวลา หรือมี booking `PENDING`/`CONFIRMED` ครอบคลุมชั่วโมงนั้น

Cache: `public, max-age=60`

```json
[
  {
    "date": "2026-08-10",
    "hours": {
      "07:00": true,
      "08:00": false,
      "09:00": false,
      "10:00": true,
      "11:00": true,
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

## POST /api/booking

Regular trip:

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

Special trip ใช้ `specialTripId` แทน `routeId` และส่ง `boardChoice: "rental" | "own"`

Success: HTTP `201`, booking เริ่มต้นด้วยสถานะ `PENDING` และ response มี `bookingId`, `ref`, `status`, `summary`

ข้อผิดพลาดหลัก:

- `400` body, route, special trip หรือวันที่ไม่ถูกต้อง
- `401` Bearer key ไม่ถูกต้อง
- `409` ทริปถูกปิดรับเพิ่ม, duplicate, closed slot, overlap หรือบันทึกไม่สำเร็จ
- `503` server ยังไม่ได้ตั้ง `BOOKING_API_KEY`

ราคาจะอ่านจากฐานข้อมูลและคำนวณที่ server ไม่รับราคาจาก client
