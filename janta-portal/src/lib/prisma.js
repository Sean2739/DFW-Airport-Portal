import { PrismaClient } from '@/generated/prisma';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Logs all queries, info, warnings, and errors
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'], // Logs all queries, info, warnings, and errors
    });
  }
  prisma = global.prisma;
}

export default prisma;
