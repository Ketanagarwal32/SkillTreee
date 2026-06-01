import { Router } from "express";
import { ReflectionController }

from "./reflection.controller";

import { authenticate } from "../../middleware/auth";

const router = Router();

const controller =
  new ReflectionController();

// TEMP DISABLE AUTH
router.use(authenticate);

// CREATE REFLECTION
router.post(
  "/",
  (req, res, next) =>
    controller.createReflection(
      req,
      res,
      next
    )
);
// GET LATEST REFLECTION PARAGRAPH
router.get(
  "/latest",
  (req, res, next) => controller.getLatestReflection(req, res, next)
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

// GET SINGLE REFLECTION
router.get(
  "/:id",
  (req, res, next) =>
    controller.getReflectionById(
      req,
      res,
      next
    )
);
export default router;