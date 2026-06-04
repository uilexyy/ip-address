import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/lib/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const databaseUrl = process.env.DATABASE_URL ?? process.env.DATABASE_IP

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
