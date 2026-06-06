#!/bin/sh
# Entrypoint สำหรับ container — sync schema เข้า DB แล้วค่อยรันแอป
# (ทำตอน start ไม่ใช่ตอน build เพราะตอน build image ยังต่อ DB ไม่ได้)
set -e

echo "▶ prisma db push (sync schema)..."
npx prisma db push --skip-generate

echo "▶ starting Next.js..."
exec "$@"
