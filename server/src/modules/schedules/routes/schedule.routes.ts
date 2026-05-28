import { Router } from "express";
import {
  cancelScheduleController,
  createScheduleController,
  getScheduleController,
  listAvailableSchedulesController,
  listMySchedulesController,
  listSchedulesController,
  updateScheduleController,
  scheduleMiddlewares,
} from "../controllers/schedule.controller";
import { validateSchedulePayload } from "../middlewares/validateSchedule.middleware";

const router = Router();

router.post(
  "/",
  scheduleMiddlewares.authenticateJWT,
  validateSchedulePayload,
  createScheduleController
);
router.get("/available", scheduleMiddlewares.authenticateJWT, listAvailableSchedulesController);
router.get("/", scheduleMiddlewares.authenticateJWT, scheduleMiddlewares.authorizeSecretaryOrAdmin, listSchedulesController);
router.get("/my", scheduleMiddlewares.authenticateJWT, listMySchedulesController);
router.get("/:id", scheduleMiddlewares.authenticateJWT, getScheduleController);
router.put(
  "/:id",
  scheduleMiddlewares.authenticateJWT,
  scheduleMiddlewares.authorizeSecretaryOrAdmin,
  validateSchedulePayload,
  updateScheduleController
);
router.delete("/:id", scheduleMiddlewares.authenticateJWT, cancelScheduleController);

export default router;
