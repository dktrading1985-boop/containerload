import { Request, Response } from "express";
import prisma from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const refreshSchema = z.object({ token: z.string() });

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_jwt_refresh_change_me";

function signAccessToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
}
function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    // NOTE: Prisma User model uses `passwordHash`
    const user = await prisma.user.create({ data: { email, passwordHash: hashed, name } });

    return res.status(201).json({ message: "User registered", user: { id: user.id, email: user.email } });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Invalid request" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email }});
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // use passwordHash field from Prisma
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    // ensure refreshToken model exists in prisma schema (refreshToken table)
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });

    return res.json({ accessToken, refreshToken });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Invalid request" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { token } = refreshSchema.parse(req.body);
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    const dbToken = await prisma.refreshToken.findUnique({ where: { token }});
    if (!dbToken || dbToken.revoked) return res.status(401).json({ error: "Invalid refresh token" });

    const newAccess = signAccessToken(payload.userId);
    const newRefresh = signRefreshToken(payload.userId);

    await prisma.refreshToken.update({ where: { token }, data: { revoked: true }});
    await prisma.refreshToken.create({ data: { token: newRefresh, userId: payload.userId }});

    return res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) return res.status(400).json({ error: "Missing token" });
    await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true }});
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "Invalid request" });
  }
};
