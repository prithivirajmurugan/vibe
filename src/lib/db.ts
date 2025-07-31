import { PrismaClient } from "@/generated/prisma";

const globalForPrima = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrima.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrima.prisma = prisma;

export default prisma;
export type { PrismaClient };