import express from 'express';
import cors from 'cors';

// route imports
import authRoutes from './routes/auth';
import containerRoutes from './routes/container';
import palletRoutes from './routes/pallet';
import loadRoutes from './routes/load';

import { PrismaClient } from '@prisma/client';
import { optimizeLoad } from './utils/loadOptimizer';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// register routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/containers', containerRoutes);
app.use('/api/v1/pallets', palletRoutes);
app.use('/api/v1/loads', loadRoutes);

// direct fallback endpoint for optimizer (workaround for router/404 issue)
app.post('/api/v1/loads/optimize', async (req, res) => {
  try {
    const { containerId, pallets } = req.body;
    if (!containerId || !pallets) {
      return res.status(400).json({ message: 'containerId and pallets are required' });
    }
    const container = await prisma.container.findUnique({ where: { id: containerId } });
    if (!container) return res.status(404).json({ message: 'Container not found' });
    const result = optimizeLoad(container as any, pallets);
    return res.json(result);
  } catch (err) {
    console.error('Direct optimize failed:', err);
    return res.status(500).json({ message: 'Direct optimize failed', error: String(err) });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => console.log('API running on port ' + PORT));
