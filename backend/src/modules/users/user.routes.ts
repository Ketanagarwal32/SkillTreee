import express from "express";

import {
  getProfile
} from "./user.controller";

const router = express.Router();

router.get(
  "/profile/:id",
  getProfile
);

export default router;