  import express from "express";

  import {
    createTask,
    getTasks,
    completeTask
  } from "./task.controller";

  const router = express.Router();

  router.post(
    "/create",
    createTask
  );

  router.get(
    "/all",
    getTasks
  );

  router.post(
    "/complete/:id",
    completeTask
  );

  export default router;