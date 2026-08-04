#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  reset-gogreen.sh — ล้างเฉพาะข้อมูลเช็คอินกิจกรรม GoGreen
#
#  ล้าง:  GoGreenRegistration (เช็คอิน/ลงทะเบียนหน้างานทั้งหมด)
#  เก็บ:  ทุกตารางอื่นของเว็บ (Booking, Member, GalleryPhoto, ฯลฯ) ไม่แตะต้อง
#
#  ปลอดภัย: backup เฉพาะตาราง GoGreenRegistration อัตโนมัติก่อนลบ +
#           ต้องพิมพ์ "yes" ยืนยัน
#
#  วิธีใช้:
#     bash deploy/reset-gogreen.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${APP_DIR}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ ไม่พบไฟล์ .env ที่ ${ENV_FILE}"
  exit 1
fi

DB_PASSWORD="$(grep -E '^DB_PASSWORD=' "$ENV_FILE" | head -1 | sed -E 's/^DB_PASSWORD=//; s/^"//; s/"$//')"
if [[ -z "$DB_PASSWORD" ]]; then
  echo "❌ ไม่พบ DB_PASSWORD ใน .env"
  exit 1
fi

command -v docker >/dev/null || { echo "❌ ไม่พบคำสั่ง docker"; exit 1; }

DB_CONTAINER="$(cd "$APP_DIR" && docker compose ps -q db)"
if [[ -z "$DB_CONTAINER" ]]; then
  echo "❌ ไม่พบ container ของ Postgres (db) — ตรวจสอบว่า docker compose up อยู่หรือไม่"
  exit 1
fi

psql_exec() { docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" psql -U sup_user -d sup_space "$@"; }

echo "════════════════════════════════════════════════════════════"
echo "  ล้างข้อมูลเช็คอิน GoGreen (ไม่กระทบข้อมูลอื่นของเว็บ)"
echo "════════════════════════════════════════════════════════════"

echo ""
echo "▶ จำนวนข้อมูลปัจจุบัน:"
psql_exec -At -c 'SELECT '\''GoGreenRegistration = '\'' || count(*) FROM "GoGreenRegistration";' | sed 's/^/    /'

echo ""
read -rp "พิมพ์ 'yes' เพื่อยืนยันการล้าง (อย่างอื่น = ยกเลิก): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "ยกเลิกแล้ว — ไม่มีอะไรถูกลบ"
  exit 0
fi

BACKUP_FILE="${APP_DIR}/backup_gogreen_before_reset_$(date +%Y%m%d_%H%M%S).sql"
echo ""
echo "▶ สำรองตาราง GoGreenRegistration ไว้ที่: ${BACKUP_FILE}"
docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" pg_dump -U sup_user -d sup_space -t '"GoGreenRegistration"' > "$BACKUP_FILE"
echo "  ✅ backup เสร็จ ($(du -h "$BACKUP_FILE" | cut -f1))"

echo ""
echo "▶ กำลังล้าง GoGreenRegistration ..."
psql_exec -c 'TRUNCATE TABLE "GoGreenRegistration";'

echo ""
echo "▶ จำนวนข้อมูลหลังล้าง:"
psql_exec -At -c 'SELECT '\''GoGreenRegistration = '\'' || count(*) FROM "GoGreenRegistration";' | sed 's/^/    /'

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ ล้างข้อมูลเช็คอิน GoGreen เสร็จแล้ว"
echo "     ถ้าต้องการกู้คืนเฉพาะตารางนี้:"
echo "       cat ${BACKUP_FILE} | docker exec -i -e PGPASSWORD=\"\$DB_PASSWORD\" ${DB_CONTAINER} psql -U sup_user -d sup_space"
echo "════════════════════════════════════════════════════════════"
