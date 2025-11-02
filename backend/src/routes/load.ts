// src/routes/load.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { optimizeLoad } from '../utils/loadOptimizer';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /
 */
router.get('/', async (_req, res) => {
  try {
    const loads = await prisma.load.findMany({
      include: { container: true, pallets: true },
    });
    return res.json(loads);
  } catch (error) {
    console.error('[load.route] GET / error:', error);
    return res.status(500).json({ message: 'Error fetching loads', error });
  }
});

/**
 * POST /  (create load record)
 */
router.post('/', async (req, res) => {
  const { containerId, pallets } = req.body;

  if (!containerId) {
    return res.status(400).json({ message: 'containerId is required' });
  }
  if (!pallets || !Array.isArray(pallets) || pallets.length === 0) {
    return res.status(400).json({ message: 'pallets array is required' });
  }

  try {
    const totalWeight = pallets.reduce((sum: number, p: any) => sum + (p.weight || 0) * (p.quantity || 0), 0);
    const utilizedVolume = pallets.reduce(
      (sum: number, p: any) => sum + (p.length || 0) * (p.width || 0) * (p.height || 0) * (p.quantity || 0),
      0
    );

    const load = await prisma.load.create({
      data: {
        containerId,
        totalWeight,
        utilizedVolume,
      },
    });

    return res.json(load);
  } catch (error) {
    console.error('[load.route] POST / error:', error);
    return res.status(400).json({ message: 'Error creating load', error });
  }
});

/**
 * POST /simulate  (use provided container object)
 */
router.post('/simulate', async (req, res) => {
  try {
    const { container, pallets } = req.body;
    if (!container || !pallets) {
      return res.status(400).json({ message: 'Container and pallets required' });
    }

    const result = optimizeLoad(container, pallets);
    return res.json(result);
  } catch (error) {
    console.error('[load.route] POST /simulate error:', error);
    return res.status(400).json({ message: 'Simulation failed', error });
  }
});

/**
 * POST /optimize  (accepts either containerId OR container object)
 */
router.post('/optimize', async (req, res) => {
  try {
    const { containerId, container, pallets } = req.body;

    if (!pallets || !Array.isArray(pallets) || pallets.length === 0) {
      return res.status(400).json({ message: 'Pallets array required' });
    }

    // choose container object
    let containerObj = container;
    if (!containerObj && containerId) {
      const found = await prisma.container.findUnique({ where: { id: containerId } });
      if (!found) return res.status(404).json({ message: 'Container not found' });
      containerObj = found;
    }

    if (!containerObj) {
      return res.status(400).json({ message: 'Provide container object or containerId' });
    }

    const result = optimizeLoad(containerObj, pallets);
    return res.json(result);
  } catch (error: any) {
    console.error('[load.route] POST /optimize error:', error);
    const errPayload = error && (error as any).message ? { message: (error as any).message } : error;
    return res.status(500).json({ message: 'Optimization failed', error: errPayload });
  }
});

export default router;
