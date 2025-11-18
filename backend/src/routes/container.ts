import { Router } from 'express';

const router = Router();

/**
 * Stub routes for containers.
 * Replace with full implementations once Prisma schema/models are confirmed.
 */

router.get('/', async (_req, res) => {
  // Return empty list until real model is implemented
  return res.json({ containers: [] });
});

router.post('/', async (_req, res) => {
  return res.status(501).json({ error: 'Not implemented - container creation' });
});

export default router;
