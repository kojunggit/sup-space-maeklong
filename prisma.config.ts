import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    // PRISMA_DATABASE_URL = postgres:// direct URL — used by CLI (prisma db push)
    // DATABASE_URL        = prisma+postgres:// Accelerate URL — used by the app at runtime
    url: process.env.PRISMA_DATABASE_URL as string,
  },
});
