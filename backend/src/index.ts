import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, version: '1.0.0' });
});

export default app;
