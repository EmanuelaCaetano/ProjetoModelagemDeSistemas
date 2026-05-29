import { dbAll, dbGet, dbRun } from "../../../config/db";
import { CreateMedicalRecordDto, MedicalRecord, MedicalRecordWithRelations } from "../entities/MedicalRecord";

export async function findMedicalRecordById(id: number): Promise<MedicalRecord | undefined> {
  return await dbGet("SELECT * FROM medical_records WHERE id = ?", [id]);
}

export async function findMedicalRecordByAnimal(animalId: number): Promise<MedicalRecord | undefined> {
  return await dbGet("SELECT * FROM medical_records WHERE animalId = ?", [animalId]);
}

export async function createOrUpdateMedicalRecord(data: CreateMedicalRecordDto & { doctorId: number }): Promise<MedicalRecord> {
  const now = new Date().toISOString();
  const existingRecord = await findMedicalRecordByAnimal(data.animalId);

  if (existingRecord) {
    const diagnostico = [existingRecord.diagnostico, data.diagnostico].filter(Boolean).join("\n\n");
    const observacoes = [existingRecord.observacoes, data.observacoes].filter(Boolean).join("\n\n");
    const medicamentos = [existingRecord.medicamentos, data.medicamentos].filter(Boolean).join("\n\n");
    const scheduleId = data.scheduleId ?? existingRecord.scheduleId;

    await dbRun(
      `UPDATE medical_records SET scheduleId = ?, doctorId = ?, diagnostico = ?, observacoes = ?, medicamentos = ?, updatedAt = ? WHERE animalId = ?`,
      [scheduleId, data.doctorId, diagnostico, observacoes, medicamentos, now, data.animalId]
    );

    return {
      ...existingRecord,
      scheduleId,
      doctorId: data.doctorId,
      diagnostico,
      observacoes,
      medicamentos,
      updatedAt: now,
    };
  }

  const result = await dbRun(
    `INSERT INTO medical_records (scheduleId, animalId, doctorId, diagnostico, observacoes, medicamentos, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.scheduleId ?? null,
      data.animalId,
      data.doctorId,
      data.diagnostico,
      data.observacoes ?? null,
      data.medicamentos ?? null,
      now,
      now,
    ]
  );

  return {
    id: result.lastID,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

export async function findMedicalRecordsByDoctor(doctorId: number): Promise<MedicalRecordWithRelations[]> {
  const rows = await dbAll(
    `SELECT mr.*, a.nome AS animal_nome, a.especie AS animal_especie, a.raca AS animal_raca,
            u.nome AS doctor_nome, u.crmv AS doctor_crmv, u.especialidade AS doctor_especialidade,
            o.id AS owner_id, o.nome AS owner_nome, o.email AS owner_email
     FROM medical_records mr
     JOIN animals a ON mr.animalId = a.id
     JOIN users u ON mr.doctorId = u.id
     JOIN users o ON a.clienteId = o.id
     WHERE mr.doctorId = ?
     ORDER BY mr.createdAt DESC`,
    [doctorId]
  );

  return rows.map((row: any) => ({
    ...row,
    animal: {
      id: row.animalId,
      nome: row.animal_nome,
      especie: row.animal_especie,
      raca: row.animal_raca,
    },
    doctor: {
      id: row.doctorId,
      nome: row.doctor_nome,
      crmv: row.doctor_crmv,
      especialidade: row.doctor_especialidade,
    },
    owner: {
      id: row.owner_id,
      nome: row.owner_nome,
      email: row.owner_email,
    },
  }));
}

export async function findMedicalRecordsByAnimal(animalId: number): Promise<MedicalRecordWithRelations[]> {
  const rows = await dbAll(
    `SELECT mr.*, a.nome AS animal_nome, a.especie AS animal_especie, a.raca AS animal_raca,
            u.nome AS doctor_nome, u.crmv AS doctor_crmv, u.especialidade AS doctor_especialidade,
            o.id AS owner_id, o.nome AS owner_nome, o.email AS owner_email
     FROM medical_records mr
     JOIN animals a ON mr.animalId = a.id
     JOIN users u ON mr.doctorId = u.id
     JOIN users o ON a.clienteId = o.id
     WHERE mr.animalId = ?
     ORDER BY mr.createdAt DESC`,
    [animalId]
  );

  return rows.map((row: any) => ({
    ...row,
    animal: {
      id: row.animalId,
      nome: row.animal_nome,
      especie: row.animal_especie,
      raca: row.animal_raca,
    },
    doctor: {
      id: row.doctorId,
      nome: row.doctor_nome,
      crmv: row.doctor_crmv,
      especialidade: row.doctor_especialidade,
    },
    owner: {
      id: row.owner_id,
      nome: row.owner_nome,
      email: row.owner_email,
    },
  }));
}
