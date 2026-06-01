import { Router } from "express";
import { JournalController } from "./journal.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
const controller = new JournalController();

// Journal routes are authenticated
router.use(authenticate);

router.post("/", (req, res, next) => controller.createEntry(req, res, next));
router.get("/", (req, res, next) => controller.getEntries(req, res, next));
router.get("/:id", (req, res, next) => controller.getEntryById(req, res, next));

export default router;
