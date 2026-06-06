#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  setup-vps.sh — ติดตั้ง SUP Space Maeklong บน VPS แบบอัตโนมัติ
#  (Ubuntu 22.04 / 24.04 · PM2 + Nginx + PostgreSQL)
#
#  วิธีใช้ (รันบน VPS ในฐานะ root หรือ sudo):
#     sudo bash setup-vps.sh
#
#  สคริปต์นี้ "idempotent" — รันซ้ำได้ ของที่ติดตั้งแล้วจะข้าม
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ─── ต้องเป็น root ───────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  echo "❌ กรุณารันด้วย sudo:  sudo bash setup-vps.sh"
  exit 1
fi

echo "════════════════════════════════════════════════════════════"
echo "  ติดตั้ง SUP Space Maeklong บน VPS"
echo "════════════════════════════════════════════════════════════"
echo ""

# ─── รับค่าจากผู้ใช้ ──────────────────────────────────────────────────────────
read -rp "โดเมน (เช่น sup-space.com) : " DOMAIN
read -rp "Git repo URL [https://github.com/kojunggit/sup-space-maeklong.git] : " REPO_URL
REPO_URL=${REPO_URL:-https://github.com/kojunggit/sup-space-maeklong.git}
read -rp "Branch ที่จะ deploy [main] : " BRANCH
BRANCH=${BRANCH:-main}

read -rsp "ตั้งรหัสผ่าน PostgreSQL (สำหรับ user sup_user) : " DB_PASS; echo ""
read -rsp "ตั้งรหัสผ่านหน้า /admin : " ADMIN_PASS; echo ""
read -rp  "Google Places API Key (เว้นว่างได้) : " GMAPS_KEY
read -rp  "Google Place ID (เว้นว่างได้) : " GPLACE_ID
read -rp  "อีเมลสำหรับ SSL/Let's Encrypt : " LE_EMAIL

DEPLOY_USER="deploy"
APP_DIR="/home/${DEPLOY_USER}/sup-space-maeklong"
DB_NAME="sup_space"
DB_USER="sup_user"

echo ""
echo "▶ เริ่มติดตั้ง... (โดเมน: ${DOMAIN}, branch: ${BRANCH})"
echo ""

# ─── 1. ระบบ + แพ็กเกจพื้นฐาน ─────────────────────────────────────────────────
echo "── [1/8] อัปเดตระบบ + ติดตั้งแพ็กเกจ ──"
apt-get update -y
apt-get upgrade -y

# Node.js 20
if ! command -v node >/dev/null || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

apt-get install -y postgresql postgresql-contrib nginx git certbot python3-certbot-nginx
command -v pm2 >/dev/null || npm install -g pm2

# ─── 2. PostgreSQL: สร้าง DB + user ───────────────────────────────────────────
echo "── [2/8] ตั้งค่า PostgreSQL ──"
systemctl enable --now postgresql

# สร้าง user ถ้ายังไม่มี
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';"
else
  sudo -u postgres psql -c "ALTER USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';"
fi

# สร้าง database ถ้ายังไม่มี
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
fi
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo -u postgres psql -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"

DB_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# ─── 3. สร้าง deploy user ─────────────────────────────────────────────────────
echo "── [3/8] สร้าง user '${DEPLOY_USER}' ──"
if ! id "${DEPLOY_USER}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
fi

# ─── 4. Clone / update repo ───────────────────────────────────────────────────
echo "── [4/8] ดึงโค้ดจาก git ──"
if [[ -d "${APP_DIR}/.git" ]]; then
  sudo -u "${DEPLOY_USER}" git -C "${APP_DIR}" fetch origin
  sudo -u "${DEPLOY_USER}" git -C "${APP_DIR}" checkout "${BRANCH}"
  sudo -u "${DEPLOY_USER}" git -C "${APP_DIR}" reset --hard "origin/${BRANCH}"
else
  sudo -u "${DEPLOY_USER}" git clone -b "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
fi

# ─── 5. เขียนไฟล์ .env ────────────────────────────────────────────────────────
echo "── [5/8] เขียน .env ──"
# สุ่ม secret สำหรับเซ็น session token ของหน้า /admin (ไม่เก็บรหัสผ่านดิบใน cookie)
SESSION_SECRET="$(openssl rand -hex 32)"
cat > "${APP_DIR}/.env" <<ENVEOF
PRISMA_DATABASE_URL="${DB_URL}"
ADMIN_PASSWORD="${ADMIN_PASS}"
SESSION_SECRET="${SESSION_SECRET}"
GOOGLE_PLACES_API_KEY="${GMAPS_KEY}"
GOOGLE_PLACE_ID="${GPLACE_ID}"
ENVEOF
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}/.env"
chmod 600 "${APP_DIR}/.env"

# ─── 6. ติดตั้ง deps + build (สร้างตาราง DB ผ่าน prisma db push) ───────────────
echo "── [6/8] npm ci + build (อาจใช้เวลาสักครู่) ──"
sudo -u "${DEPLOY_USER}" bash -lc "cd '${APP_DIR}' && npm ci && npm run build"

# ─── 7. รันด้วย PM2 + ตั้ง startup ────────────────────────────────────────────
echo "── [7/8] รันแอปด้วย PM2 ──"
sudo -u "${DEPLOY_USER}" bash -lc "cd '${APP_DIR}' && pm2 start ecosystem.config.js --update-env || pm2 restart sup-space"
sudo -u "${DEPLOY_USER}" bash -lc "pm2 save"
# ตั้งให้ PM2 ของ deploy user รันตอน boot
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "${DEPLOY_USER}" --hp "/home/${DEPLOY_USER}" | tail -1 | bash || true

# ─── 8. Nginx + SSL ───────────────────────────────────────────────────────────
echo "── [8/8] ตั้งค่า Nginx + SSL ──"
NGINX_CONF="/etc/nginx/sites-available/sup-space"
sed "s/your-domain.com/${DOMAIN}/g" "${APP_DIR}/deploy/nginx.conf" > "${NGINX_CONF}"
ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/sup-space
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ขอ certificate (ถ้า DNS ชี้มาที่เครื่องนี้แล้ว)
if [[ -n "${LE_EMAIL}" ]]; then
  certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" \
    --non-interactive --agree-tos -m "${LE_EMAIL}" --redirect || \
    echo "⚠ certbot ยังไม่สำเร็จ — เช็คว่า DNS ของ ${DOMAIN} ชี้มาที่ IP นี้แล้วค่อยรัน: certbot --nginx -d ${DOMAIN}"
fi

# ─── เปิด firewall ────────────────────────────────────────────────────────────
if command -v ufw >/dev/null; then
  ufw allow OpenSSH || true
  ufw allow 'Nginx Full' || true
  yes | ufw enable || true
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ เสร็จแล้ว!  เปิด:  https://${DOMAIN}"
echo "     หน้า admin:  https://${DOMAIN}/admin"
echo ""
echo "  คำสั่งดูแล:"
echo "     sudo -u ${DEPLOY_USER} pm2 status"
echo "     sudo -u ${DEPLOY_USER} pm2 logs sup-space"
echo "  อัปเดตเว็บครั้งต่อไป:  sudo bash ${APP_DIR}/deploy/update.sh"
echo "════════════════════════════════════════════════════════════"
