import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  // Prisma user.id is a string (UUID or similar)
  userId?: string;
  // allow headers access without TS error
  headers: {
    authorization?: string;
    [k: string]: any;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    // ensure userId stored as a string (matches Prisma types)
    req.userId = payload?.sub ? String(payload.sub) : undefined;
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
