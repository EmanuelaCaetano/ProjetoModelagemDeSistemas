"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleMiddlewares = void 0;
exports.createScheduleController = createScheduleController;
exports.listSchedulesController = listSchedulesController;
exports.listMySchedulesController = listMySchedulesController;
exports.listSchedulesByDateController = listSchedulesByDateController;
exports.getScheduleController = getScheduleController;
exports.updateScheduleController = updateScheduleController;
exports.cancelScheduleController = cancelScheduleController;
const auth_1 = require("../../../middlewares/auth");
const authorize_1 = require("../../../middlewares/authorize");
const schedule_service_1 = require("../services/schedule.service");
async function createScheduleController(req, res) {
    try {
        const data = req.body;
        const clientId = data.clientId || req.userId;
        if (!clientId || !data.petId || !data.veterinarianId || !data.date) {
            return res.status(400).json({ error: "clientId, petId, veterinarianId e date são obrigatórios." });
        }
        const scheduleData = {
            ...data,
            clientId,
        };
        const schedule = await (0, schedule_service_1.createSchedule)(scheduleData);
        return res.status(201).json({ message: "Consulta criada com sucesso.", schedule });
    }
    catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao criar consulta." });
    }
}
async function listSchedulesController(req, res) {
    try {
        const schedules = await (0, schedule_service_1.findAllSchedules)();
        return res.json(schedules);
    }
    catch (error) {
        return res.status(500).json({ error: "Erro ao buscar agenda completa." });
    }
}
async function listMySchedulesController(req, res) {
    try {
        if (!req.userId || !req.userRole) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }
        const schedules = req.userRole === 'medico'
            ? await findSchedulesByVeterinarian(req.userId)
            : await (0, schedule_service_1.findSchedulesByClient)(req.userId);
        return res.json(schedules);
    }
    catch (error) {
        return res.status(500).json({ error: "Erro ao buscar suas consultas." });
    }
}
async function listSchedulesByDateController(req, res) {
    const dateParam = Array.isArray(req.query.date) ? req.query.date[0] : req.query.date;
    const dateString = typeof dateParam === 'string' ? dateParam : '';
    if (!dateString || isNaN(Date.parse(dateString))) {
        return res.status(400).json({ error: "Data inválida." });
    }
    try {
        const schedules = await (0, schedule_service_1.findSchedulesByDate)(dateString);
        return res.json(schedules);
    }
    catch (error) {
        return res.status(500).json({ error: "Erro ao buscar agendamentos para a data." });
    }
}
async function getScheduleController(req, res) {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = idParam ?? "";
        const schedule = await (0, schedule_service_1.findScheduleById)(id);
        if (!schedule) {
            return res.status(404).json({ error: "Consulta não encontrada." });
        }
        return res.json(schedule);
    }
    catch (error) {
        return res.status(500).json({ error: "Erro ao buscar consulta." });
    }
}
async function updateScheduleController(req, res) {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = idParam ?? "";
        const data = req.body;
        const schedule = await (0, schedule_service_1.updateSchedule)(id, data);
        if (!schedule) {
            return res.status(404).json({ error: "Consulta não encontrada." });
        }
        return res.json({ message: "Consulta atualizada com sucesso.", schedule });
    }
    catch (error) {
        return res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao atualizar consulta." });
    }
}
async function cancelScheduleController(req, res) {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const id = idParam ?? "";
        const schedule = await (0, schedule_service_1.cancelSchedule)(id);
        if (!schedule) {
            return res.status(404).json({ error: "Consulta não encontrada." });
        }
        return res.json({ message: "Consulta cancelada com sucesso.", schedule });
    }
    catch (error) {
        return res.status(500).json({ error: "Erro ao cancelar consulta." });
    }
}
exports.scheduleMiddlewares = {
    authenticateJWT: auth_1.authenticateJWT,
    authorizeSecretaryOrAdmin: (0, authorize_1.authorizeRoles)("secretario", "administrador"),
};
//# sourceMappingURL=schedule.controller.js.map