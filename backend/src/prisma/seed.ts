import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const hash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@containerload.org' },
    update: { password: hash },
    create: {
      email: 'admin@containerload.org',
      password: hash,
      role: 'ADMIN'
    },
  });

  console.log('Seed complete');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
