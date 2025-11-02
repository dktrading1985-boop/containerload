import { Router } from 'express';
import { jwtMiddleware, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/profile', jwtMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, createdAt: true, firstName: true, lastName: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('profile error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
