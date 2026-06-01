import { Router } from "express";
import { MemoryController } from "./memory.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
const controller = new MemoryController();

// Memory routes require authentication
router.use(authenticate);

router.get("/", (req, res, next) => controller.getMemories(req, res, next));
router.post("/monthly", (req, res, next) => controller.generateMonthlySummary(req, res, next));

export default router;
