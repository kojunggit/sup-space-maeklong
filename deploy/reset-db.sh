#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  reset-db.sh — ล้างข้อมูลจอง/ทริป ก่อนเปิดใช้งานจริง
#
#  ล้าง:  Booking, SpecialTrip, User
#  เก็บ:  Setting (Telegram, closed slots, ค่า config ต่าง ๆ)
#
#  ปลอดภัย: backup ทั้ง DB อัตโนมัติก่อนลบ + ต้องพิมพ์ "yes" ยืนยัน
#
#  วิธีใช้ (บน VPS):
#     sudo -u deploy bash /home/deploy/sup-space-maeklong/deploy/reset-db.sh
#  หรือถ้าอยู่ในโฟลเดอร์โปรเจกต์อยู่แล้ว:
#     bash deploy/reset-db.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# หาไฟล์ .env (อยู่ที่ root ของโปรเจกต์ — โฟลเดอร์แม่ของ deploy/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${APP_DIR}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ ไม่พบไฟล์ .env ที่ ${ENV_FILE}"
  exit 1
fi

# ดึงค่า PRISMA_DATABASE_URL (ตัด quote ออก)
DB_URL="$(grep -E '^PRISMA_DATABASE_URL=' "$ENV_FILE" | head -1 | sed -E 's/^PRISMA_DATABASE_URL=//; s/^"//; s/"$//')"
if [[ -z "$DB_URL" ]]; then
  echo "❌ ไม่พบ PRISMA_DATABASE_URL ใน .env"
  exit 1
fi

command -v psql    >/dev/null || { echo "❌ ไม่พบคำสั่ง psql — ติดตั้ง postgresql-client ก่อน"; exit 1; }
command -v pg_dump >/dev/null || { echo "❌ ไม่พบคำสั่ง pg_dump"; exit 1; }

echo "════════════════════════════════════════════════════════════"
echo "  ล้างข้อมูลจอง/ทริป (เก็บ Setting ไว้)"
echo "════════════════════════════════════════════════════════════"

# จำนวนแถวก่อนลบ
echo ""
echo "▶ จำนวนข้อมูลปัจจุบัน:"
psql "$DB_URL" -At -c '
  SELECT '\''Booking     = '\''     || count(*) FROM "Booking"
  UNION ALL SELECT '\''SpecialTrip = '\'' || count(*) FROM "SpecialTrip"
  UNION ALL SELECT '\''User        = '\'' || count(*) FROM "User"
  UNION ALL SELECT '\''Setting     = '\'' || count(*) || '\'' (จะเก็บไว้)'\'' FROM "Setting";
' | sed 's/^/    /'

# ยืนยัน
echo ""
read -rp "พิมพ์ 'yes' เพื่อยืนยันการล้าง (อย่างอื่น = ยกเลิก): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "ยกเลิกแล้ว — ไม่มีอะไรถูกลบ"
  exit 0
fi

# backup ก่อนลบ
BACKUP_FILE="${APP_DIR}/backup_before_reset_$(date +%Y%m%d_%H%M%S).sql"
echo ""
echo "▶ สำรองข้อมูลทั้ง DB ไว้ที่: ${BACKUP_FILE}"
pg_dump "$DB_URL" > "$BACKUP_FILE"
echo "  ✅ backup เสร็จ ($(du -h "$BACKUP_FILE" | cut -f1))"

# ล้าง (truncate ทั้ง 3 ตารางพร้อมกัน เพื่อจัดการ foreign key Booking→User)
echo ""
echo "▶ กำลังล้าง Booking, SpecialTrip, User ..."
psql "$DB_URL" -c 'TRUNCATE TABLE "Booking", "SpecialTrip", "User" RESTART IDENTITY;'

# จำนวนแถวหลังลบ
echo ""
echo "▶ จำนวนข้อมูลหลังล้าง:"
psql "$DB_URL" -At -c '
  SELECT '\''Booking     = '\''     || count(*) FROM "Booking"
  UNION ALL SELECT '\''SpecialTrip = '\'' || count(*) FROM "SpecialTrip"
  UNION ALL SELECT '\''User        = '\'' || count(*) FROM "User"
  UNION ALL SELECT '\''Setting     = '\'' || count(*) || '\'' (เก็บไว้)'\'' FROM "Setting";
' | sed 's/^/    /'

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ ล้างข้อมูลเสร็จแล้ว — พร้อมเปิดใช้งานจริง"
echo "     ถ้าต้องการกู้คืน:  psql \"\$PRISMA_DATABASE_URL\" < ${BACKUP_FILE}"
echo "════════════════════════════════════════════════════════════"
