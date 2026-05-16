"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointmentController = createAppointmentController;
exports.getAppointmentsController = getAppointmentsController;
exports.getAppointmentByIdController = getAppointmentByIdController;
exports.getAppointmentsByClienteController = getAppointmentsByClienteController;
exports.updateAppointmentController = updateAppointmentController;
exports.deleteAppointmentController = deleteAppointmentController;
const express_1 = require("express");
const appointment_1 = require("../models/appointment");
async function createAppointmentController(req, res) {
    const body = req.body;
    if (!body.animalId || !body.clienteId || !body.medicoId || !body.dataHora) {
        return res.status(400).json({ error: "Animal, cliente, médico e data/hora são obrigatórios." });
    }
    try {
        const conflict = await (0, appointment_1.findAppointmentByMedicoAndDate)(body.medicoId, body.dataHora);
        if (conflict) {
            return res.status(409).json({ error: "Horário indisponível para este médico." });
        }
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
    const { id } = req.params;
    try {
        const appointment = await (0, appointment_1.findAppointmentById)(parseInt(id));
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
async function getAppointmentsByClienteController(req, res) {
    const { clienteId } = req.params;
    try {
        const appointments = await (0, appointment_1.getAppointmentsWithDetailsByCliente)(parseInt(clienteId));
        return res.json(appointments);
    }
    catch (error) {
        console.error("Erro ao buscar consultas do cliente:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function updateAppointmentController(req, res) {
    const { id } = req.params;
    const appointmentData = req.body;
    try {
        const appointmentId = parseInt(id);
        const existingAppointment = await (0, appointment_1.findAppointmentById)(appointmentId);
        if (!existingAppointment) {
            return res.status(404).json({ error: "Consulta não encontrada." });
        }
        const targetMedicoId = appointmentData.medicoId ?? existingAppointment.medicoId;
        const targetDataHora = appointmentData.dataHora ?? existingAppointment.dataHora;
        if (appointmentData.medicoId || appointmentData.dataHora) {
            const conflict = await (0, appointment_1.findAppointmentByMedicoAndDate)(targetMedicoId, targetDataHora, appointmentId);
            if (conflict) {
                return res.status(409).json({ error: "Horário indisponível para este médico." });
            }
        }
        const appointment = await (0, appointment_1.updateAppointment)(appointmentId, appointmentData);
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
    const { id } = req.params;
    try {
        const deleted = await (0, appointment_1.deleteAppointment)(parseInt(id));
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