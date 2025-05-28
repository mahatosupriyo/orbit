import { PrismaClient } from "@prisma/client";
import { env } from "@/env";

/**
 * Creates a new PrismaClient instance.
 * - Enables detailed logging in development for easier debugging.
 */
const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

/**
 * Use a global variable to persist the Prisma client across hot reloads in development.
 * Prevents exhausting your database connection limit.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

/**
 * Export a singleton Prisma client instance.
 * - Reuses the client in development to avoid creating multiple instances.
 */
export const db = globalForPrisma.prisma ?? createPrismaClient();

// In development, store the Prisma client on the global object for reuse.
if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;