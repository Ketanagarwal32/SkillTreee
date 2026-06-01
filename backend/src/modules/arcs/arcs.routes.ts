import { Router } from "express";
import { ArcsController } from "./arcs.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
const controller = new ArcsController();

// Arcs routes require authentication
router.use(authenticate);

router.post("/", (req, res, next) => controller.createArc(req, res, next));
router.get("/", (req, res, next) => controller.getArcs(req, res, next));
router.patch("/:id/toggle", (req, res, next) => controller.toggleArc(req, res, next));

export default router;
