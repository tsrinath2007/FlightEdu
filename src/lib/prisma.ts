import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Prefer DIRECT_URL (port 5432, no pgbouncer) for the PrismaPg adapter
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    if (typeof window === "undefined") {
      console.warn("⚠️ Warning: DATABASE_URL / DIRECT_URL is not configured.");
    }
    return null as any;
  }

  // Create a pg Pool with connection limits to avoid EMAXCONNSESSION
  const pool = new pg.Pool({
    connectionString,
    max: 3, // Keep pool size small per container to prevent exceeding limits
    idleTimeoutMillis: 10000, // Automatically close idle connections after 10s
    connectionTimeoutMillis: 5000, // Fail fast after 5s if DB is congested
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle database connection pool client:", err);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

