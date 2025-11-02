import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all pallets
router.get('/', async (_req, res) => {
  const pallets = await prisma.pallet.findMany();
  res.json(pallets);
});

// Create a new pallet
router.post('/', async (req, res) => {
  const { length, width, height, weight, quantity, loadId } = req.body;
  try {
    const pallet = await prisma.pallet.create({
      data: { length, width, height, weight, quantity, loadId },
    });
    res.json(pallet);
  } catch (error) {
    res.status(400).json({ message: 'Error creating pallet', error });
  }
});

export default router;
