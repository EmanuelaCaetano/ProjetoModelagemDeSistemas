import { dbAll, dbGet, dbRun } from "../../../config/db";
import { v4 as uuidv4 } from "uuid";
import { CreateScheduleDto } from "../dtos/createSchedule.dto";
import { UpdateScheduleDto } from "../dtos/updateSchedule.dto";
import { Schedule, ScheduleStatus, ScheduleWithRelations } from "../entities/Schedule";

const SCHEDULE_STATUS: ScheduleStatus[] = ["scheduled", "cancelled", "completed"];

function normalizeDate(date: string) {
  return new Date(date).toISOString();
}

export async function findScheduleById(id: string): Promise<Schedule | null> {
  return await dbGet("SELECT * FROM schedules WHERE id = ?", [id]);
}

export async function findAllSchedules(): Promise<ScheduleWithRelations[]> {
  const rows = await dbAll(`
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

export async function findSchedulesByClient(clientId: number): Promise<ScheduleWithRelations[]> {
  const rows = await dbAll(`
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

export async function findSchedulesByVeterinarian(veterinarianId: number): Promise<ScheduleWithRelations[]> {
  const rows = await dbAll(`
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

export async function findSchedulesByDate(date: string): Promise<ScheduleWithRelations[]> {
  const rows = await dbAll(`
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

export async function hasVeterinarianConflict(veterinarianId: number, date: string, scheduleId?: string): Promise<boolean> {
  const normalized = normalizeDate(date);
  const existing = await dbGet(
    `SELECT id FROM schedules WHERE veterinarianId = ? AND date = ? ${scheduleId ? "AND id != ?" : ""}`,
    scheduleId ? [veterinarianId, normalized, scheduleId] : [veterinarianId, normalized]
  );

  return Boolean(existing);
}

export async function createSchedule(data: CreateScheduleDto): Promise<Schedule> {
  const date = normalizeDate(data.date);

  if (await hasVeterinarianConflict(data.veterinarianId, date)) {
    throw new Error("O médico já possui uma consulta agendada nesse horário.");
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  await dbRun(
    `INSERT INTO schedules (id, clientId, petId, veterinarianId, date, status, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.clientId,
      data.petId,
      data.veterinarianId,
      date,
      "scheduled",
      data.notes || null,
      now,
      now,
    ]
  );

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

export async function updateSchedule(id: string, data: UpdateScheduleDto): Promise<Schedule | null> {
  const schedule = await findScheduleById(id);
  if (!schedule) return null;

  const fields: string[] = [];
  const values: any[] = [];

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

  await dbRun(`UPDATE schedules SET ${fields.join(", ")} WHERE id = ?`, values);
  return await findScheduleById(id);
}

export async function cancelSchedule(id: string): Promise<Schedule | null> {
  const schedule = await findScheduleById(id);
  if (!schedule) return null;

  await dbRun("UPDATE schedules SET status = ?, updatedAt = ? WHERE id = ?", [
    "cancelled",
    new Date().toISOString(),
    id,
  ]);

  return await findScheduleById(id);
}
