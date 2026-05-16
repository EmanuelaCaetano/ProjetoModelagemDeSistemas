"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const router = (0, express_1.Router)();
router.post("/", appointmentController_1.createAppointmentController);
router.get("/", appointmentController_1.getAppointmentsController);
router.get("/cliente/:clienteId", appointmentController_1.getAppointmentsByClienteController);
router.get("/:id", appointmentController_1.getAppointmentByIdController);
router.put("/:id", appointmentController_1.updateAppointmentController);
router.delete("/:id", appointmentController_1.deleteAppointmentController);
exports.default = router;
//# sourceMappingURL=appointmentRoutes.js.map