import { Request, Response, NextFunction } from "express";

/**
 * Simple Express error handler compatible with app.use(errorHandler)
 * Always exported as default function.
 */
export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (res.headersSent) return;
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";
  // avoid leaking stack in production, but include in dev
  if (process.env.NODE_ENV === "development") {
    return res.status(status).json({ error: message, stack: err?.stack });
  }
  return res.status(status).json({ error: message });
}
