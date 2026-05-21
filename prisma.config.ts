import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    // Direct postgres:// URL — used by CLI (prisma db push) and runtime via adapter-pg
    url: process.env.PRISMA_DATABASE_URL as string,
  },
});
