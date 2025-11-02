import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all containers
router.get('/', async (req, res) => {
  const containers = await prisma.container.findMany();
  res.json(containers);
});

// Create a container
router.post('/', async (req, res) => {
  const { name, length, width, height, maxWeight } = req.body;
  try {
    const container = await prisma.container.create({
      data: { name, length, width, height, maxWeight },
    });
    res.json(container);
  } catch (error) {
    res.status(400).json({ message: 'Error creating container', error });
  }
});

export default router;
