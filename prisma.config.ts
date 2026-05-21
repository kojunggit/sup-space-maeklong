import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    // Use the Accelerate URL (prisma+postgres://) for both CLI and runtime.
    // Prisma Accelerate supports db push, migrate, and all runtime queries.
    url: process.env.DATABASE_URL as string,
  },
});
