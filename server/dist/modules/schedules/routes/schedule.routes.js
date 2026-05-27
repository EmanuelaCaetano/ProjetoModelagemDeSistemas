"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const validateSchedule_middleware_1 = require("../middlewares/validateSchedule.middleware");
const router = (0, express_1.Router)();
// Rota para clientes agendarem consultas diretamente
router.post("/book", schedule_controller_1.scheduleMiddlewares.authenticateJWT, validateSchedule_middleware_1.validateSchedulePayload, schedule_controller_1.createScheduleController);
router.post("/", schedule_controller_1.scheduleMiddlewares.authenticateJWT, schedule_controller_1.scheduleMiddlewares.authorizeSecretaryOrAdmin, validateSchedule_middleware_1.validateSchedulePayload, schedule_controller_1.createScheduleController);
router.get("/", schedule_controller_1.scheduleMiddlewares.authenticateJWT, schedule_controller_1.scheduleMiddlewares.authorizeSecretaryOrAdmin, schedule_controller_1.listSchedulesController);
router.get("/date", schedule_controller_1.scheduleMiddlewares.authenticateJWT, schedule_controller_1.listSchedulesByDateController);
router.get("/my", schedule_controller_1.scheduleMiddlewares.authenticateJWT, schedule_controller_1.listMySchedulesController);
router.get("/:id", schedule_controller_1.scheduleMiddlewares.authenticateJWT, schedule_controller_1.getScheduleController);
router.put("/:id", schedule_controller_1.scheduleMiddlewares.authenticateJWT, schedule_controller_1.scheduleMiddlewares.authorizeSecretaryOrAdmin, validateSchedule_middleware_1.validateSchedulePayload, schedule_controller_1.updateScheduleController);
router.delete("/:id", schedule_controller_1.scheduleMiddlewares.authenticateJWT, schedule_controller_1.scheduleMiddlewares.authorizeSecretaryOrAdmin, schedule_controller_1.cancelScheduleController);
exports.default = router;
//# sourceMappingURL=schedule.routes.js.map