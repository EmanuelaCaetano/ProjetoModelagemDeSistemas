"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findScheduleById = findScheduleById;
exports.findAllSchedules = findAllSchedules;
exports.findSchedulesByClient = findSchedulesByClient;
exports.findSchedulesByVeterinarian = findSchedulesByVeterinarian;
exports.findSchedulesByDate = findSchedulesByDate;
exports.hasVeterinarianConflict = hasVeterinarianConflict;
exports.createSchedule = createSchedule;
exports.updateSchedule = updateSchedule;
exports.cancelSchedule = cancelSchedule;
const db_1 = require("../../../config/db");
const uuid_1 = require("uuid");
const SCHEDULE_STATUS = ["scheduled", "cancelled", "completed"];
function normalizeDate(date) {
    return new Date(date).toISOString();
}
async function findScheduleById(id) {
    return await (0, db_1.dbGet)("SELECT * FROM schedules WHERE id = ?", [id]);
}
async function findAllSchedules() {
    const rows = await (0, db_1.dbAll)(`
    SELECT s.*, u.nome AS client_nome, u.email AS client_email,
           p.nome AS pet_nome, p.especie AS pet_especie, p.raca AS pet_raca,
           v.nome AS vet_nome, v.especialidade AS vet_especialidade
    FROM schedules s
    JOIN users u ON s.clientId = u.id
    JOIN animals p ON s.petId = p.id
    JOIN users v ON s.veterinarianId = v.id
    ORDER BY s.date ASC
  `);
    return rows.map((row) => ({
        ...row,
        client: {
            id: row.clientId,
            nome: row.client_nome,
            email: row.client_email,
        },
        pet: {
            id: row.petId,
            nome: row.pet_nome,
            especie: row.pet_especie,
            raca: row.pet_raca,
        },
        veterinarian: {
            id: row.veterinarianId,
            nome: row.vet_nome,
            especialidade: row.vet_especialidade,
        },
    }));
}
async function findSchedulesByClient(clientId) {
    const rows = await (0, db_1.dbAll)(`
    SELECT s.*, u.nome AS client_nome, u.email AS client_email,
           p.nome AS pet_nome, p.especie AS pet_especie, p.raca AS pet_raca,
           v.nome AS vet_nome, v.especialidade AS vet_especialidade
    FROM schedules s
    JOIN users u ON s.clientId = u.id
    JOIN animals p ON s.petId = p.id
    JOIN users v ON s.veterinarianId = v.id
    WHERE s.clientId = ?
    ORDER BY s.date ASC
  `, [clientId]);
    return rows.map((row) => ({
        ...row,
        client: {
            id: row.clientId,
            nome: row.client_nome,
            email: row.client_email,
        },
        pet: {
            id: row.petId,
            nome: row.pet_nome,
            especie: row.pet_especie,
            raca: row.pet_raca,
        },
        veterinarian: {
            id: row.veterinarianId,
            nome: row.vet_nome,
            especialidade: row.vet_especialidade,
        },
    }));
}
async function findSchedulesByVeterinarian(veterinarianId) {
    const rows = await (0, db_1.dbAll)(`
    SELECT s.*, u.nome AS client_nome, u.email AS client_email,
           p.nome AS pet_nome, p.especie AS pet_especie, p.raca AS pet_raca,
           v.nome AS vet_nome, v.especialidade AS vet_especialidade
    FROM schedules s
    JOIN users u ON s.clientId = u.id
    JOIN animals p ON s.petId = p.id
    JOIN users v ON s.veterinarianId = v.id
    WHERE s.veterinarianId = ?
    ORDER BY s.date ASC
  `, [veterinarianId]);
    return rows.map((row) => ({
        ...row,
        client: {
            id: row.clientId,
            nome: row.client_nome,
            email: row.client_email,
        },
        pet: {
            id: row.petId,
            nome: row.pet_nome,
            especie: row.pet_especie,
            raca: row.pet_raca,
        },
        veterinarian: {
            id: row.veterinarianId,
            nome: row.vet_nome,
            especialidade: row.vet_especialidade,
        },
    }));
}
async function findSchedulesByDate(date) {
    const rows = await (0, db_1.dbAll)(`
    SELECT s.*, u.nome AS client_nome, u.email AS client_email,
           p.nome AS pet_nome, p.especie AS pet_especie, p.raca AS pet_raca,
           v.nome AS vet_nome, v.especialidade AS vet_especialidade
    FROM schedules s
    JOIN users u ON s.clientId = u.id
    JOIN animals p ON s.petId = p.id
    JOIN users v ON s.veterinarianId = v.id
    WHERE date(s.date) = date(?)
    ORDER BY s.date ASC
  `, [date]);
    return rows.map((row) => ({
        ...row,
        client: {
            id: row.clientId,
            nome: row.client_nome,
            email: row.client_email,
        },
        pet: {
            id: row.petId,
            nome: row.pet_nome,
            especie: row.pet_especie,
            raca: row.pet_raca,
        },
        veterinarian: {
            id: row.veterinarianId,
            nome: row.vet_nome,
            especialidade: row.vet_especialidade,
        },
    }));
}
async function hasVeterinarianConflict(veterinarianId, date, scheduleId) {
    const normalized = normalizeDate(date);
    const existing = await (0, db_1.dbGet)(`SELECT id FROM schedules WHERE veterinarianId = ? AND date = ? ${scheduleId ? "AND id != ?" : ""}`, scheduleId ? [veterinarianId, normalized, scheduleId] : [veterinarianId, normalized]);
    return Boolean(existing);
}
async function createSchedule(data) {
    const date = normalizeDate(data.date);
    if (await hasVeterinarianConflict(data.veterinarianId, date)) {
        throw new Error("O médico já possui uma consulta agendada nesse horário.");
    }
    const id = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    await (0, db_1.dbRun)(`INSERT INTO schedules (id, clientId, petId, veterinarianId, date, status, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        id,
        data.clientId,
        data.petId,
        data.veterinarianId,
        date,
        "scheduled",
        data.notes || null,
        now,
        now,
    ]);
    return {
        id,
        clientId: data.clientId,
        petId: data.petId,
        veterinarianId: data.veterinarianId,
        date,
        status: "scheduled",
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
    };
}
async function updateSchedule(id, data) {
    const schedule = await findScheduleById(id);
    if (!schedule)
        return null;
    const fields = [];
    const values = [];
    if (data.clientId !== undefined) {
        fields.push("clientId = ?");
        values.push(data.clientId);
    }
    if (data.petId !== undefined) {
        fields.push("petId = ?");
        values.push(data.petId);
    }
    if (data.veterinarianId !== undefined) {
        fields.push("veterinarianId = ?");
        values.push(data.veterinarianId);
    }
    if (data.date !== undefined) {
        const normalized = normalizeDate(data.date);
        fields.push("date = ?");
        values.push(normalized);
    }
    if (data.status !== undefined) {
        if (!SCHEDULE_STATUS.includes(data.status)) {
            throw new Error("Status inválido.");
        }
        fields.push("status = ?");
        values.push(data.status);
    }
    if (data.notes !== undefined) {
        fields.push("notes = ?");
        values.push(data.notes);
    }
    if (fields.length === 0) {
        return schedule;
    }
    const newVetId = data.veterinarianId ?? schedule.veterinarianId;
    const newDate = data.date ? normalizeDate(data.date) : schedule.date;
    if (await hasVeterinarianConflict(newVetId, newDate, id)) {
        throw new Error("O médico já possui uma consulta agendada nesse horário.");
    }
    fields.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);
    await (0, db_1.dbRun)(`UPDATE schedules SET ${fields.join(", ")} WHERE id = ?`, values);
    return await findScheduleById(id);
}
async function cancelSchedule(id) {
    const schedule = await findScheduleById(id);
    if (!schedule)
        return null;
    await (0, db_1.dbRun)("UPDATE schedules SET status = ?, updatedAt = ? WHERE id = ?", [
        "cancelled",
        new Date().toISOString(),
        id,
    ]);
    return await findScheduleById(id);
}
//# sourceMappingURL=schedule.service.js.map