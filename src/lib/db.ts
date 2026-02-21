import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const getPrisma = () => {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    try {
        console.log('Lazy initializing Prisma with DATABASE_URL:', process.env.DATABASE_URL);
        const prisma = new PrismaClient();
        if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
        return prisma;
    } catch (error) {
        console.error('Failed to initialize Prisma Client:', error);
        throw error;
    }
}
