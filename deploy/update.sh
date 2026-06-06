#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  update.sh — อัปเดตเว็บเป็นเวอร์ชันล่าสุด (pull + build + restart)
#  รันบน VPS:   sudo bash /home/deploy/sup-space-maeklong/deploy/update.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DEPLOY_USER="deploy"
APP_DIR="/home/${DEPLOY_USER}/sup-space-maeklong"
BRANCH="${1:-main}"

if [[ $EUID -ne 0 ]]; then
  echo "❌ กรุณารันด้วย sudo:  sudo bash update.sh"
  exit 1
fi

echo "▶ อัปเดต branch '${BRANCH}'..."
sudo -u "${DEPLOY_USER}" bash -lc "
  cd '${APP_DIR}' &&
  git fetch origin &&
  git checkout '${BRANCH}' &&
  git reset --hard 'origin/${BRANCH}' &&
  if [ -f .env ] && ! grep -q '^SESSION_SECRET=' .env; then
    echo \"SESSION_SECRET=\\\"\$(openssl rand -hex 32)\\\"\" >> .env;
    echo '▶ เพิ่ม SESSION_SECRET ลง .env (ของใหม่จากแพตช์ security)';
  fi &&
  npm ci &&
  npm run build &&
  pm2 restart sup-space
"
echo "✅ อัปเดตเสร็จแล้ว"
