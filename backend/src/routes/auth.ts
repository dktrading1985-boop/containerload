import { Router } from "express";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post("/register", async (req: any, res: any, next: any) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, firstName, lastName }
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName } });
  } catch (err) { next(err); }
});

router.post("/login", async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, (user as any).passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName } });
  } catch (err) { next(err); }
});

export default router;
