import { Router } from "express";
import { runCalculation } from "../controllers/calculationController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();
router.post("/quick", runCalculation);
router.post("/store", requireAuth, runCalculation);

export default router;
