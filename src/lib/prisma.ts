import { PrismaClient } from '@prisma/client';

// The database (Neon) suspends itself when idle. The first request after a
// pause can hit a closed connection ("terminating connection due to
// administrator command") or a compute that takes longer than Prisma's default
// 5 s to wake up ("Can't reach database server"). Both used to surface as a
// "This page couldn't load" crash. We give the connection more time to open
// and retry the query a few times before giving up.

function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '20');
    if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '20');
    return url.toString();
  } catch {
    return raw;
  }
}

const RETRYABLE_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017', 'P2024']);
const RETRYABLE_MESSAGE = /can't reach database server|terminating connection|connection (?:closed|reset|terminated)|server has closed the connection|timed out fetching a new connection|ECONNRESET|ETIMEDOUT/i;

function isConnectionError(error: unknown) {
  const e = error as { name?: string; code?: string; errorCode?: string; message?: string } | null;
  if (!e) return false;
  if (e.name === 'PrismaClientInitializationError') return true;
  if (e.code && RETRYABLE_CODES.has(e.code)) return true;
  if (e.errorCode && RETRYABLE_CODES.has(e.errorCode)) return true;
  return RETRYABLE_MESSAGE.test(e.message || '');
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createClient() {
  const url = databaseUrl();
  const base = new PrismaClient({
    ...(url ? { datasourceUrl: url } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        const delays = [300, 1000, 2500];
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            if (attempt >= delays.length || !isConnectionError(error)) throw error;
            await sleep(delays[attempt]);
          }
        }
      },
    },
  });
}

type ExtendedPrisma = ReturnType<typeof createClient>;
const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrisma };

export const prisma = globalForPrisma.prisma ?? createClient();

// Reuse one client per server instance (also in production, where a warm
// lambda handles many requests) instead of opening new connections each time.
globalForPrisma.prisma = prisma;
