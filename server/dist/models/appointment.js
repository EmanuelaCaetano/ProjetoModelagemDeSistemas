"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublic = toPublic;
exports.createAppointment = createAppointment;
exports.findAppointmentById = findAppointmentById;
exports.findAppointmentsByCliente = findAppointmentsByCliente;
exports.findAppointmentsByMedico = findAppointmentsByMedico;
exports.findAllAppointments = findAllAppointments;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
exports.getAppointmentsWithDetails = getAppointmentsWithDetails;
const db_1 = require("../config/db");
function toPublic(appointment) {
    return {
        id: appointment.id,
        animalId: appointment.animalId,
        clienteId: appointment.clienteId,
        medicoId: appointment.medicoId,
        dataHora: appointment.dataHora,
        status: appointment.status,
        observacoes: appointment.observacoes,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
    };
}
async function createAppointment(appointmentData) {
    const now = new Date().toISOString();
    const result = await (0, db_1.dbRun)(`INSERT INTO appointments (animalId, clienteId, medicoId, dataHora, status, observacoes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        appointmentData.animalId,
        appointmentData.clienteId,
        appointmentData.medicoId,
        appointmentData.dataHora,
        appointmentData.status || "agendada",
        appointmentData.observacoes || null,
        now,
        now
    ]);
    const appointment = await (0, db_1.dbGet)("SELECT * FROM appointments WHERE id = ?", [result.lastID]);
    return appointment;
}
async function findAppointmentById(id) {
    return await (0, db_1.dbGet)("SELECT * FROM appointments WHERE id = ?", [id]);
}
async function findAppointmentsByCliente(clienteId) {
    return await (0, db_1.dbAll)("SELECT * FROM appointments WHERE clienteId = ? ORDER BY dataHora DESC", [clienteId]);
}
async function findAppointmentsByMedico(medicoId) {
    return await (0, db_1.dbAll)("SELECT * FROM appointments WHERE medicoId = ? ORDER BY dataHora DESC", [medicoId]);
}
async function findAllAppointments() {
    return await (0, db_1.dbAll)("SELECT * FROM appointments ORDER BY dataHora DESC");
}
async function updateAppointment(id, appointmentData) {
    const now = new Date().toISOString();
    const fields = [];
    const values = [];
    if (appointmentData.animalId !== undefined) {
        fields.push("animalId = ?");
        values.push(appointmentData.animalId);
    }
    if (appointmentData.clienteId !== undefined) {
        fields.push("clienteId = ?");
        values.push(appointmentData.clienteId);
    }
    if (appointmentData.medicoId !== undefined) {
        fields.push("medicoId = ?");
        values.push(appointmentData.medicoId);
    }
    if (appointmentData.dataHora !== undefined) {
        fields.push("dataHora = ?");
        values.push(appointmentData.dataHora);
    }
    if (appointmentData.status !== undefined) {
        fields.push("status = ?");
        values.push(appointmentData.status);
    }
    if (appointmentData.observacoes !== undefined) {
        fields.push("observacoes = ?");
        values.push(appointmentData.observacoes);
    }
    fields.push("updatedAt = ?");
    values.push(now);
    values.push(id);
    await (0, db_1.dbRun)(`UPDATE appointments SET ${fields.join(", ")} WHERE id = ?`, values);
    return await findAppointmentById(id);
}
async function deleteAppointment(id) {
    const result = await (0, db_1.dbRun)("DELETE FROM appointments WHERE id = ?", [id]);
    return result.changes > 0;
}
async function getAppointmentsWithDetails() {
    const appointments = await (0, db_1.dbAll)(`
    SELECT 
      a.*,
      an.nome as animal_nome, an.especie, an.raca,
      c.nome as cliente_nome, c.email as cliente_email,
      m.nome as medico_nome, m.especialidade
    FROM appointments a
    JOIN animals an ON a.animalId = an.id
    JOIN users c ON a.clienteId = c.id
    JOIN users m ON a.medicoId = m.id
    ORDER BY a.dataHora DESC
  `);
    return appointments.map(app => ({
        id: app.id,
        animalId: app.animalId,
        clienteId: app.clienteId,
        medicoId: app.medicoId,
        dataHora: app.dataHora,
        status: app.status,
        observacoes: app.observacoes,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        animal: {
            id: app.animalId,
            nome: app.animal_nome,
            especie: app.especie,
            raca: app.raca,
        },
        cliente: {
            id: app.clienteId,
            nome: app.cliente_nome,
            email: app.cliente_email,
        },
        medico: {
            id: app.medicoId,
            nome: app.medico_nome,
            especialidade: app.especialidade,
        },
    }));
}
//# sourceMappingURL=appointment.js.map