import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import journalRoutes from "./modules/journal/journal.routes";
import attributesRoutes from "./modules/attributes/attributes.routes";
import memoryRoutes from "./modules/memory/memory.routes";
import arcsRoutes from "./modules/arcs/arcs.routes";
import reflectionRoutes from "./modules/reflection/reflection.routes";
import sessionRoutes from "./modules/session/session.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// Secure CORS configuration supporting local dev and production domains
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, postman, server-to-server)
      if (!origin) return callback(null, true);
      
      // Allow matching origins or any origin during development
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      } else {
        return callback(new Error("Blocked by CORS policy."));
      }
    },
    credentials: true
  })
);

app.use(express.json());

// Base informational endpoint
app.get("/", (req, res) => {
  res.json({
    name: "SkillTree Backend API",
    status: "healthy",
    version: "1.0.0",
    philosophy: "A calm observation of human growth."
  });
});

// Mount modular API sub-routes
app.use("/auth", authRoutes);
app.use("/journal", journalRoutes);
app.use("/attributes", attributesRoutes);
app.use("/memories", memoryRoutes);
app.use("/arcs", arcsRoutes);
app.use("/reflection", reflectionRoutes);
app.use("/session", sessionRoutes);

// Global Error Handling Middleware (must be registered last)
app.use(errorHandler);

export default app;
