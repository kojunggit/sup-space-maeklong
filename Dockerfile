# ── deps: ติดตั้ง dependencies + prisma generate (ผ่าน postinstall) ──────────────
FROM node:20-slim AS deps
WORKDIR /app
# prisma generate (postinstall) ต้องใช้ schema → คัดลอกก่อน npm ci
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci

# ── builder: สร้าง production build ──────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# รัน `next build` ตรง ๆ (ไม่ใช่ `npm run build` ที่มี `prisma db push`)
# — การ sync schema เข้า DB ทำตอน container start ใน entrypoint แทน
RUN npx next build

# ── runner: image สำหรับรันจริง ──────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# openssl: prisma schema-engine (db push) ต้องใช้
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
