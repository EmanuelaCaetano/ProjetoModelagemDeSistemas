import { Router } from "express";
import {
  cancelScheduleController,
  createScheduleController,
  getScheduleController,
  listMySchedulesController,
  listSchedulesByDateController,
  listSchedulesController,
  updateScheduleController,
  scheduleMiddlewares,
} from "../controllers/schedule.controller";
import { validateSchedulePayload } from "../middlewares/validateSchedule.middleware";

const router = Router();

// Rota para clientes agendarem consultas diretamente
router.post(
  "/book",
  scheduleMiddlewares.authenticateJWT,
  validateSchedulePayload,
  createScheduleController
);

router.post(
  "/",
  scheduleMiddlewares.authenticateJWT,
  scheduleMiddlewares.authorizeSecretaryOrAdmin,
  validateSchedulePayload,
  createScheduleController
);
router.get("/", scheduleMiddlewares.authenticateJWT, scheduleMiddlewares.authorizeSecretaryOrAdmin, listSchedulesController);
router.get("/date", scheduleMiddlewares.authenticateJWT, listSchedulesByDateController);
router.get("/my", scheduleMiddlewares.authenticateJWT, listMySchedulesController);
router.get("/:id", scheduleMiddlewares.authenticateJWT, getScheduleController);
router.put(
  "/:id",
  scheduleMiddlewares.authenticateJWT,
  scheduleMiddlewares.authorizeSecretaryOrAdmin,
  validateSchedulePayload,
  updateScheduleController
);
router.delete("/:id", scheduleMiddlewares.authenticateJWT, scheduleMiddlewares.authorizeSecretaryOrAdmin, cancelScheduleController);

export default router;
