import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth";
import calcRoutes from "./routes/calculations";
import healthRoutes from "./routes/health";
import errorHandler from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// HEALTH
app.use("/api/health", healthRoutes);

// AUTH
app.use("/api/auth", authRoutes);

// CALCULATIONS
app.use("/api/calculations", calcRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Default 404 (fallback)
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
