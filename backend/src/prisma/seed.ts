import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function upsertAdmin() {
  const email = 'admin@containerload.org';
  const plain = process.env.ADMIN_PASSWORD || 'Container@123';
  const hash = await bcrypt.hash(plain, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      role: 'admin'
    },
    create: {
      id: randomUUID(),
      email,
      passwordHash: hash,
      role: 'admin',
      firstName: 'Admin',
      lastName: ''
    }
  });

  console.log('Admin upsert completed for', email);
}

(async () => {
  try {
    await upsertAdmin();
  } catch (err) {
    console.error('Seed error', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
