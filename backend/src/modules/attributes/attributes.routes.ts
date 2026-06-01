import { Router } from "express";
import { AttributesController } from "./attributes.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
const controller = new AttributesController();

// Attributes routes require authentication
router.use(authenticate);

router.get("/", (req, res, next) => controller.getAttributes(req, res, next));
router.post("/stagnant-check", (req, res, next) => controller.triggerStagnantCheck(req, res, next));
router.get("/:id/history", (req, res, next) => controller.getAttributeHistory(req, res, next));

export default router;
