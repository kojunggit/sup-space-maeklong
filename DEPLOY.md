# คู่มือ Deploy ขึ้น VPS ส่วนตัว

Deploy เว็บ SUP Space Maeklong (Next.js 15 + PostgreSQL) ขึ้น VPS ของคุณเอง
ด้วย **PM2 + Nginx + PostgreSQL** — ไม่ต้องแก้โค้ดเลย

> ทดสอบกับ Ubuntu 22.04 / 24.04 (Debian ใช้คำสั่งคล้ายกัน)
> ขอสิทธิ์ `sudo` บน VPS และมีโดเมนชี้ A record มาที่ IP ของ VPS แล้ว

> **มี 2 วิธี deploy:**
> - **A) Docker + Traefik** — ถ้า VPS มี Traefik คุม routing/SSL อยู่แล้ว (โฮสต์หลายเว็บ) → ดูหัวข้อ 🐳 ด้านล่าง
> - **B) Native (PM2 + Nginx)** — ถ้า VPS ตัวนี้ใช้รันเว็บนี้อย่างเดียว → ดูหัวข้อ ⚡/manual
>
> ⚠️ **อย่าใช้ทั้งสองวิธีบนเครื่องเดียวกัน** — `setup-vps.sh` (native) จะติดตั้ง Nginx + certbot
> ที่แย่ง port 80/443 กับ Traefik

---

## 🐳 A) Deploy แบบ Docker + Traefik

เหมาะกับ VPS ที่มี **Traefik** เป็น reverse proxy อยู่แล้ว (เช่น Hostinger ที่รันหลายเว็บ)
ไฟล์ที่เกี่ยวข้อง: `Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`, `.env.docker.example`

```bash
# บน VPS
git clone https://github.com/kojunggit/sup-space-maeklong.git
cd sup-space-maeklong

# ตั้งค่า env
cp .env.docker.example .env
nano .env          # ใส่ DB_PASSWORD, ADMIN_PASSWORD, SESSION_SECRET, Google keys
                   # SESSION_SECRET สร้างด้วย: openssl rand -hex 32

# build + run (จะสร้าง Postgres container + แอปให้)
docker compose up -d --build
```

**สิ่งที่เกิดขึ้น:**
- สร้าง Postgres container (ข้อมูลเก็บใน volume `pgdata`)
- entrypoint รัน `prisma db push` sync schema ตอน start แล้วรัน `next start` (port 3000 ภายใน)
- แอป **ไม่ publish port** ออก host — Traefik route เข้ามาตาม labels ใน `docker-compose.yml`

**สิ่งที่ต้องตรงกับ Traefik ของคุณ** (แก้ใน `docker-compose.yml` ถ้าต่าง):
- `traefik.http.routers.supspace.entrypoints=websecure` — ชื่อ entrypoint ของ HTTPS
- `traefik.http.routers.supspace.tls.certresolver=letsencrypt` — ชื่อ certresolver
- `Host(...)` rule — โดเมนจริง

### Traefik แบบ `network_mode: host` — สำคัญ
สแต็กนี้สร้าง docker network ชื่อ `supspace` และตั้ง label `traefik.docker.network=supspace`
ให้แล้ว เพราะ Traefik แบบ host จะคุยกับ container ผ่าน IP บน bridge นี้ (host route ถึงได้)

ต้องมั่นใจว่า Traefik:
1. เปิด **docker provider** + เข้าถึง `/var/run/docker.sock` ได้
2. มี entrypoint `websecure` (:443) + certresolver `letsencrypt` ตามที่ config ไว้

**ถ้าเปิดเว็บแล้วได้ 502 Bad Gateway** (Traefik host หา container ไม่เจอ) — ใช้ fallback แบบ
file-provider แทน labels:

```bash
# 1) ให้แอป publish เฉพาะ localhost — แก้ docker-compose.yml ใส่ใต้ service app:
#      ports: ["127.0.0.1:3000:3000"]
#    แล้วลบ labels ออก (หรือปล่อยไว้ก็ได้)
# 2) เพิ่ม dynamic config ให้ Traefik (ในโฟลเดอร์ที่ Traefik watch อยู่):
```
```yaml
# /etc/traefik/dynamic/supspace.yml
http:
  routers:
    supspace:
      rule: "Host(`supspacemaeklong.com`) || Host(`www.supspacemaeklong.com`)"
      entryPoints: ["websecure"]
      service: supspace
      tls: { certResolver: letsencrypt }
  services:
    supspace:
      loadBalancer:
        servers:
          - url: "http://127.0.0.1:3000"
```

### อัปเดต / ดูแล (Docker)
```bash
git pull origin main
docker compose up -d --build        # build ใหม่ + restart
docker compose logs -f app          # ดู log
docker compose exec db pg_dump -U sup_user sup_space > backup_$(date +%F).sql   # backup
```

---

## ⚡ B) ติดตั้ง native แบบอัตโนมัติ (คำสั่งเดียวจบ)

ถ้าไม่อยากทำทีละขั้น ใช้สคริปต์อัตโนมัติได้เลย — มันจะติดตั้งทุกอย่าง
(Node, Postgres, Nginx, PM2, สร้าง DB, build, รันแอป, ตั้ง SSL) และ
**ถามค่าที่จำเป็นตอนรัน** (โดเมน, รหัส DB, รหัส admin, Google keys):

```bash
ssh root@YOUR_VPS_IP
# ดึงสคริปต์มาจาก repo (หรือ git clone ทั้ง repo มาก่อนก็ได้)
curl -fsSLO https://raw.githubusercontent.com/kojunggit/sup-space-maeklong/main/deploy/setup-vps.sh
sudo bash setup-vps.sh
```

> ก่อนรัน — ตั้ง DNS A record ของโดเมนให้ชี้มาที่ IP ของ VPS ก่อน
> (ไม่งั้นขั้นขอ SSL จะยังไม่ผ่าน รันใหม่ทีหลังได้)

อัปเดตเว็บครั้งต่อไป:
```bash
sudo bash /home/deploy/sup-space-maeklong/deploy/update.sh
```

ด้านล่างคือ **ขั้นตอนแบบ manual** (ทำเองทีละขั้น / เอาไว้เข้าใจว่าสคริปต์ทำอะไร)

---

## 0. สิ่งที่ต้องมี

- VPS (RAM อย่างน้อย 1 GB, แนะนำ 2 GB) รัน Ubuntu
- โดเมน เช่น `your-domain.com` ตั้ง A record → IP ของ VPS
- ค่า `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` (ถ้าอยากให้รีวิว Google ทำงาน)

---

## 1. ติดตั้ง Node.js 20, PostgreSQL, Nginx, PM2

```bash
# เข้า VPS
ssh root@YOUR_VPS_IP

# อัปเดตระบบ
sudo apt update && sudo apt upgrade -y

# Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL + Nginx + git
sudo apt install -y postgresql postgresql-contrib nginx git

# PM2 (process manager) ติดตั้งทั่วทั้งเครื่อง
sudo npm install -g pm2

# เช็คเวอร์ชัน
node -v      # ควรเป็น v20.x
psql --version
nginx -v
```

---

## 2. สร้าง database + user ใน PostgreSQL

```bash
sudo -u postgres psql
```

ใน psql shell (เปลี่ยน `STRONG_PASSWORD` เป็นรหัสจริง):

```sql
CREATE DATABASE sup_space;
CREATE USER sup_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE sup_space TO sup_user;
-- ให้สิทธิ์ schema (Postgres 15+ จำเป็น)
\c sup_space
GRANT ALL ON SCHEMA public TO sup_user;
\q
```

จะได้ connection string:
```
postgresql://sup_user:STRONG_PASSWORD@localhost:5432/sup_space
```

---

## 3. Clone โค้ด + ตั้งค่า environment

```bash
# สร้าง user สำหรับรันแอป (ไม่ควรรันด้วย root)
sudo adduser --disabled-password --gecos "" deploy
sudo su - deploy

# clone repo (ใช้ URL repo ของคุณ)
git clone https://github.com/kojunggit/sup-space-maeklong.git
cd sup-space-maeklong

# เลือก branch ที่ต้องการ deploy (เช่น main หลัง merge แล้ว)
git checkout main

# สร้างไฟล์ .env จากตัวอย่าง
cp .env.example .env
nano .env
```

ใส่ค่าใน `.env`:
```env
PRISMA_DATABASE_URL="postgresql://sup_user:STRONG_PASSWORD@localhost:5432/sup_space"
ADMIN_PASSWORD="รหัสผ่านหน้าadminที่เดายาก"
# คีย์ลับเซ็น session token ของหน้า /admin — สร้างด้วย: openssl rand -hex 32
SESSION_SECRET="ค่าสุ่มยาวๆจาก openssl rand -hex 32"
GOOGLE_PLACES_API_KEY="..."
GOOGLE_PLACE_ID="..."
```

> หมายเหตุ: ถ้าไม่ตั้ง `SESSION_SECRET` ระบบจะ fallback ไปใช้ `ADMIN_PASSWORD`
> เซ็น token แทน — ยังใช้งานได้แต่แนะนำให้ตั้งแยกเป็นค่าสุ่ม สคริปต์
> `setup-vps.sh`/`update.sh` จะสร้างให้อัตโนมัติถ้ายังไม่มี

---

## 4. ติดตั้ง dependencies + สร้างตาราง + build

```bash
# ติดตั้ง packages (postinstall จะรัน prisma generate ให้เอง)
npm ci

# build — script นี้จะรัน `prisma db push` (สร้างตารางใน DB) แล้วตามด้วย `next build`
# ต้องต่อ DB ได้ตอนนี้ (ขั้น 2 ทำไว้แล้ว)
npm run build
```

> ถ้า build ผ่าน จะเห็นรายการ route ทั้งหมด (`/`, `/routes`, `/admin/...`)
> ตาราง `Setting`, `User`, `Booking` จะถูกสร้างใน `sup_space` อัตโนมัติ

---

## 5. รันด้วย PM2

```bash
# รันตาม config ในโปรเจกต์ (ฟัง port 3000)
pm2 start ecosystem.config.js

# เช็คว่ารันอยู่
pm2 status
pm2 logs sup-space        # ดู log (Ctrl+C ออก)

# ตั้งให้ PM2 รันอัตโนมัติเมื่อ reboot เครื่อง
pm2 save
pm2 startup               # คัดลอกคำสั่งที่มันพ่นออกมาไปรันด้วย sudo
```

ทดสอบว่าแอปขึ้น:
```bash
curl -I http://localhost:3000      # ควรได้ HTTP/1.1 200 OK
```

---

## 6. ตั้ง Nginx reverse proxy

```bash
# ออกจาก user deploy กลับไป root/sudo
exit

# คัดลอก config ตัวอย่างจากโปรเจกต์ (เปลี่ยนโดเมนก่อน)
sudo cp /home/deploy/sup-space-maeklong/deploy/nginx.conf /etc/nginx/sites-available/sup-space
sudo nano /etc/nginx/sites-available/sup-space   # แก้ your-domain.com เป็นโดเมนจริง

# enable + ปิด default site
sudo ln -s /etc/nginx/sites-available/sup-space /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# ทดสอบ config + reload
sudo nginx -t
sudo systemctl reload nginx
```

ตอนนี้เปิด `http://your-domain.com` ควรเห็นเว็บแล้ว (ยังเป็น http)

---

## 7. เปิด HTTPS ด้วย Let's Encrypt (ฟรี)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

ตอบคำถาม (อีเมล + ยอมรับเงื่อนไข + เลือก redirect http→https)
certbot จะแก้ Nginx ให้รองรับ 443 + ต่ออายุ cert อัตโนมัติ

เสร็จแล้ว! เปิด `https://your-domain.com` ได้เลย

---

## การอัปเดตเว็บครั้งต่อไป

```bash
sudo su - deploy
cd sup-space-maeklong
git pull origin main
npm ci
npm run build
pm2 restart sup-space
```

---

## คำสั่งดูแลที่ใช้บ่อย

| ทำอะไร | คำสั่ง |
|---|---|
| ดูสถานะแอป | `pm2 status` |
| ดู log สด | `pm2 logs sup-space` |
| รีสตาร์ทแอป | `pm2 restart sup-space` |
| backup database | `pg_dump -U sup_user sup_space > backup_$(date +%F).sql` |
| restore database | `psql -U sup_user sup_space < backup.sql` |
| ดู log Nginx | `sudo tail -f /var/log/nginx/error.log` |

---

## Firewall (แนะนำ)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'    # เปิด port 80 + 443
sudo ufw enable
```
> ไม่ต้องเปิด port 3000 และ 5432 ออกสู่ภายนอก — Nginx กับแอปคุยกันใน localhost เท่านั้น

---

## Troubleshooting

- **`npm run build` error ต่อ DB ไม่ได้** → เช็ค `PRISMA_DATABASE_URL` ใน `.env`
  และว่า Postgres รันอยู่ (`sudo systemctl status postgresql`)
- **เปิดเว็บแล้ว 502 Bad Gateway** → แอปไม่ได้รัน เช็ค `pm2 status` / `pm2 logs`
- **รีวิว Google ไม่ขึ้น** → ตรวจ `GOOGLE_PLACES_API_KEY` และเปิด Places API ใน Google Cloud
- **หน้า /admin เข้าไม่ได้** → ใช้รหัสตาม `ADMIN_PASSWORD` ใน `.env`
  (แก้แล้วต้อง `pm2 restart sup-space`)
