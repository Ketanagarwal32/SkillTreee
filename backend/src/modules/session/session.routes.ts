import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { SessionController } from "./session.controller";

const router = Router();
const controller = new SessionController();

router.use(authenticate);

router.get("/current", (req, res, next) => controller.getCurrentSession(req, res, next));

export default router;
