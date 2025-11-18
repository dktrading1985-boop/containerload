import { Router } from 'express';

const router = Router();

/**
 * Stub routes for pallets.
 */

router.get('/', async (_req, res) => {
  return res.json({ pallets: [] });
});

router.post('/', async (_req, res) => {
  return res.status(501).json({ error: 'Not implemented - create pallet' });
});

export default router;
