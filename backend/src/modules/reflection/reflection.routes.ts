import { Router } from "express";
import { ReflectionController } from "./reflection.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

const controller =
  new ReflectionController();

router.use(authenticate);

// REQUEST REFLECTION
router.post(
  "/request",
  (req, res, next) =>
    controller.requestReflection(
      req,
      res,
      next
    )
);

// GET ALL REFLECTIONS
router.get(
  "/",
  (req, res, next) =>
    controller.getReflections(
      req,
      res,
      next
    )
);
export default router;
