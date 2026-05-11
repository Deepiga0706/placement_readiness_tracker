import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter() {
      const { PrismaClient } = await import('@prisma/client');
      return new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } },
      }) as any;
    },
  },
});
