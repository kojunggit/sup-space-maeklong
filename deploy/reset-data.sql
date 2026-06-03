-- ─────────────────────────────────────────────────────────────────────────────
--  reset-data.sql — ล้างข้อมูลจอง/ทริป ก่อนเปิดใช้งานจริง
--
--  ล้าง:  Booking, SpecialTrip, User
--  เก็บ:  Setting (Telegram, closed slots, ค่า config ต่าง ๆ)
--
--  TRUNCATE ทั้ง 3 ตารางพร้อมกันเพื่อจัดการ foreign key (Booking.userId → User)
-- ─────────────────────────────────────────────────────────────────────────────
TRUNCATE TABLE "Booking", "SpecialTrip", "User" RESTART IDENTITY;
