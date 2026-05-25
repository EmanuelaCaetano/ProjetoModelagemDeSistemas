"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointmentController = createAppointmentController;
exports.getAppointmentsController = getAppointmentsController;
exports.getAppointmentByIdController = getAppointmentByIdController;
exports.updateAppointmentController = updateAppointmentController;
exports.deleteAppointmentController = deleteAppointmentController;
const appointment_1 = require("../models/appointment");
async function createAppointmentController(req, res) {
    const body = req.body;
    if (!body.animalId || !body.clienteId || !body.medicoId || !body.dataHora) {
        return res.status(400).json({ error: "Animal, cliente, médico e data/hora são obrigatórios." });
    }
    try {
        const appointment = await (0, appointment_1.createAppointment)(body);
        return res.status(201).json({ message: "Consulta agendada com sucesso.", consulta: appointment });
    }
    catch (error) {
        console.error("Erro ao agendar consulta:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function getAppointmentsController(req, res) {
    try {
        const appointments = await (0, appointment_1.getAppointmentsWithDetails)();
        return res.json(appointments);
    }
    catch (error) {
        console.error("Erro ao buscar consultas:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function getAppointmentByIdController(req, res) {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    try {
        const appointment = await (0, appointment_1.findAppointmentById)(id);
        if (!appointment) {
            return res.status(404).json({ error: "Consulta não encontrada." });
        }
        return res.json(appointment);
    }
    catch (error) {
        console.error("Erro ao buscar consulta:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function updateAppointmentController(req, res) {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    const appointmentData = req.body;
    try {
        const appointment = await (0, appointment_1.updateAppointment)(id, appointmentData);
        if (!appointment) {
            return res.status(404).json({ error: "Consulta não encontrada." });
        }
        return res.json({ message: "Consulta atualizada com sucesso.", consulta: appointment });
    }
    catch (error) {
        console.error("Erro ao atualizar consulta:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function deleteAppointmentController(req, res) {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    try {
        const deleted = await (0, appointment_1.deleteAppointment)(id);
        if (!deleted) {
            return res.status(404).json({ error: "Consulta não encontrada." });
        }
        return res.json({ message: "Consulta removida com sucesso." });
    }
    catch (error) {
        console.error("Erro ao remover consulta:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
//# sourceMappingURL=appointmentController.js.map