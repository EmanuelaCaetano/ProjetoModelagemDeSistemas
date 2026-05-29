import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth";
import { findScheduleById } from "../../schedules/services/schedule.service";
import { findPetById } from "../../../models/pet";
import {
  createOrUpdateMedicalRecord,
  findMedicalRecordByAnimal,
  findMedicalRecordsByDoctor,
} from "../services/medicalRecord.service";
import { CreateMedicalRecordDto } from "../dtos/createMedicalRecord.dto";
import { updateMedicalRecordById, deleteMedicalRecordById, findMedicalRecordById } from "../services/medicalRecord.service";

export async function createMedicalRecordController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId || req.userRole !== "medico") {
      return res.status(403).json({ error: "Apenas médicos podem registrar prontuários." });
    }

    const body = req.body as CreateMedicalRecordDto;
    if (!body.animalId || !body.diagnostico) {
      return res.status(400).json({ error: "Animal e diagnóstico são obrigatórios." });
    }

    if (body.scheduleId) {
      const schedule = await findScheduleById(body.scheduleId);
      if (!schedule) {
        return res.status(404).json({ error: "Consulta não encontrada." });
      }
      if (schedule.veterinarianId !== req.userId) {
        return res.status(403).json({ error: "Apenas o médico responsável pode registrar o prontuário desta consulta." });
      }
      if (schedule.petId !== body.animalId) {
        return res.status(400).json({ error: "O animal informado não corresponde à consulta selecionada." });
      }
    }

    const pet = await findPetById(body.animalId);
    if (!pet) {
      return res.status(404).json({ error: "Animal não encontrado." });
    }

    const record = await createOrUpdateMedicalRecord({
      scheduleId: body.scheduleId,
      animalId: body.animalId,
      doctorId: req.userId,
      diagnostico: body.diagnostico,
      observacoes: body.observacoes,
      medicamentos: body.medicamentos,
    });

    return res.status(201).json({ message: "Prontuário atualizado com sucesso.", prontuario: record });
  } catch (error) {
    console.error("Erro ao criar prontuário:", error);
    return res.status(500).json({ error: "Erro interno ao registrar prontuário." });
  }
}

export async function listMyMedicalRecordsController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId || req.userRole !== "medico") {
      return res.status(403).json({ error: "Apenas médicos podem acessar seus prontuários." });
    }

    const records = await findMedicalRecordsByDoctor(req.userId);
    return res.json(records);
  } catch (error) {
    console.error("Erro ao buscar prontuários:", error);
    return res.status(500).json({ error: "Erro interno ao buscar prontuários." });
  }
}

export async function listMedicalRecordsByAnimalController(req: AuthRequest, res: Response) {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const animalId = idParam ? parseInt(idParam, 10) : NaN;
    if (isNaN(animalId)) {
      return res.status(400).json({ error: "ID de animal inválido." });
    }

    if (!req.userId || !req.userRole) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (req.userRole === "cliente") {
      const animal = await findPetById(animalId);
      if (!animal || animal.clienteId !== req.userId) {
        return res.status(403).json({ error: "Acesso negado aos prontuários deste animal." });
      }
    }

    const record = await findMedicalRecordByAnimal(animalId);
    return res.json(record ?? null);
  } catch (error) {
    console.error("Erro ao buscar prontuários do animal:", error);
    return res.status(500).json({ error: "Erro interno ao buscar prontuários do animal." });
  }
}

export async function updateMedicalRecordController(req: AuthRequest, res: Response) {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const body = req.body as Partial<CreateMedicalRecordDto>;
    const existing = await findMedicalRecordById(id);
    if (!existing) return res.status(404).json({ error: 'Prontuário não encontrado.' });

    // Apenas o médico responsável ou administrador podem editar
    if (req.userRole === 'medico' && req.userId !== existing.doctorId) {
      return res.status(403).json({ error: 'Apenas o médico responsável pode editar este prontuário.' });
    }

    const updated = await updateMedicalRecordById(id, { ...body, doctorId: existing.doctorId });
    return res.json({ message: 'Prontuário atualizado com sucesso.', prontuario: updated });
  } catch (error) {
    console.error('Erro ao atualizar prontuário:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar prontuário.' });
  }
}

export async function deleteMedicalRecordController(req: AuthRequest, res: Response) {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const existing = await findMedicalRecordById(id);
    if (!existing) return res.status(404).json({ error: 'Prontuário não encontrado.' });

    // Apenas o médico responsável ou administrador podem excluir
    if (req.userRole === 'medico' && req.userId !== existing.doctorId) {
      return res.status(403).json({ error: 'Apenas o médico responsável pode excluir este prontuário.' });
    }

    await deleteMedicalRecordById(id);
    return res.json({ message: 'Prontuário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir prontuário:', error);
    return res.status(500).json({ error: 'Erro interno ao excluir prontuário.' });
  }
}
