import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log the DATABASE_URL to ensure it's being read
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not Set")

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Log the prisma instance after initialization
console.log("Prisma client initialized:", !!prisma)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
