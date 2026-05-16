import { Router } from "express";
import {
  createAppointmentController,
  getAppointmentsController,
  getAppointmentByIdController,
  getAppointmentsByClienteController,
  updateAppointmentController,
  deleteAppointmentController
} from "../controllers/appointmentController";

const router = Router();

router.post("/", createAppointmentController);
router.get("/", getAppointmentsController);
router.get("/cliente/:clienteId", getAppointmentsByClienteController);
router.get("/:id", getAppointmentByIdController);
router.put("/:id", updateAppointmentController);
router.delete("/:id", deleteAppointmentController);

export default router;