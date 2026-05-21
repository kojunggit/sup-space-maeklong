import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    // Prisma Postgres (Vercel) injects DATABASE_URL
    // Falls back to POSTGRES_PRISMA_URL for local dev
    url: (process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL) as string,
  },
});
