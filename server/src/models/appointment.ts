import { dbGet, dbRun, dbAll } from "../config/db";

export type AppointmentStatus = "agendada" | "confirmada" | "cancelada" | "concluida";

export interface AppointmentBase {
  animalId: number;
  clienteId: number;
  medicoId: number;
  dataHora: string;
  status?: AppointmentStatus;
  observacoes?: string;
}

export interface Appointment extends AppointmentBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentPublic {
  id: number;
  animalId: number;
  clienteId: number;
  medicoId: number;
  dataHora: string;
  status: AppointmentStatus;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  animal?: {
    id: number;
    nome: string;
    especie: string;
    raca?: string;
  };
  cliente?: {
    id: number;
    nome: string;
    email: string;
  };
  medico?: {
    id: number;
    nome: string;
    especialidade?: string;
  };
}

export function toPublic(appointment: Appointment): AppointmentPublic {
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

export async function createAppointment(appointmentData: AppointmentBase): Promise<Appointment> {
  const now = new Date().toISOString();
  const result = await dbRun(
    `INSERT INTO appointments (animalId, clienteId, medicoId, dataHora, status, observacoes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      appointmentData.animalId,
      appointmentData.clienteId,
      appointmentData.medicoId,
      appointmentData.dataHora,
      appointmentData.status || "agendada",
      appointmentData.observacoes || null,
      now,
      now
    ]
  );

  const appointment = await dbGet("SELECT * FROM appointments WHERE id = ?", [result.lastID]);
  return appointment;
}

export async function findAppointmentById(id: number): Promise<Appointment | null> {
  return await dbGet("SELECT * FROM appointments WHERE id = ?", [id]);
}

export async function findAppointmentsByCliente(clienteId: number): Promise<Appointment[]> {
  return await dbAll("SELECT * FROM appointments WHERE clienteId = ? ORDER BY dataHora DESC", [clienteId]);
}

export async function findAppointmentsByMedico(medicoId: number): Promise<Appointment[]> {
  return await dbAll("SELECT * FROM appointments WHERE medicoId = ? ORDER BY dataHora DESC", [medicoId]);
}

export async function findAllAppointments(): Promise<Appointment[]> {
  return await dbAll("SELECT * FROM appointments ORDER BY dataHora DESC");
}

export async function updateAppointment(id: number, appointmentData: Partial<AppointmentBase>): Promise<Appointment | null> {
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

  await dbRun(`UPDATE appointments SET ${fields.join(", ")} WHERE id = ?`, values);

  return await findAppointmentById(id);
}

export async function deleteAppointment(id: number): Promise<boolean> {
  const result = await dbRun("DELETE FROM appointments WHERE id = ?", [id]);
  return result.changes > 0;
}

export async function getAppointmentsWithDetails(): Promise<AppointmentPublic[]> {
  const appointments = await dbAll(`
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