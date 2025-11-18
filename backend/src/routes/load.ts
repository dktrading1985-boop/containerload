import { Router } from 'express';

const router = Router();

/**
 * Stub routes for loads.
 * Implement actual logic tied to Prisma models later.
 */

router.get('/', async (_req, res) => {
  return res.json({ loads: [] });
});

router.post('/', async (_req, res) => {
  return res.status(501).json({ error: 'Not implemented - create load' });
});

router.post('/simulate', async (_req, res) => {
  return res.status(501).json({ error: 'Not implemented - simulate' });
});

router.post('/optimize', async (_req, res) => {
  return res.status(501).json({ error: 'Not implemented - optimize' });
});

export default router;
