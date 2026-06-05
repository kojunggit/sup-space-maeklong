import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Single shared PrismaClient. Creating a new client (and connection pool) on
// every server-action / route call exhausts Postgres connections on serverless
// and leaks them on a long-running VPS. Cache the instance on globalThis so it
// survives hot-reload in dev and is reused across invocations in the same
// runtime instance.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL!);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
