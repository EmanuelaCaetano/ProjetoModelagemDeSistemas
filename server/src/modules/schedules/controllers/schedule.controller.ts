import { Response } from "express";
import { AuthRequest, authenticateJWT } from "../../../middlewares/auth";
import { authorizeRoles } from "../../../middlewares/authorize";
import {
  cancelSchedule,
  createSchedule,
  findAllSchedules,
  findSchedulesByDate,
  findScheduleById,
  findSchedulesByClient,
  updateSchedule,
} from "../services/schedule.service";
import { CreateScheduleDto } from "../dtos/createSchedule.dto";
import { UpdateScheduleDto } from "../dtos/updateSchedule.dto";

export async function createScheduleController(req: AuthRequest, res: Response) {
  try {
    const data = req.body as CreateScheduleDto;
    const clientId = data.clientId || req.userId;

    if (!clientId || !data.petId || !data.veterinarianId || !data.date) {
      return res.status(400).json({ error: "clientId, petId, veterinarianId e date são obrigatórios." });
    }

    const scheduleData = {
      ...data,
      clientId,
    };

    const schedule = await createSchedule(scheduleData);
    return res.status(201).json({ message: "Consulta criada com sucesso.", schedule });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao criar consulta." });
  }
}

export async function listSchedulesController(req: AuthRequest, res: Response) {
  try {
    const schedules = await findAllSchedules();
    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar agenda completa." });
  }
}

export async function listMySchedulesController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const schedules = await findSchedulesByClient(req.userId);
    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar suas consultas." });
  }
}

export async function listSchedulesByDateController(req: AuthRequest, res: Response) {
  const dateParam = Array.isArray(req.query.date) ? req.query.date[0] : req.query.date;
  const dateString = typeof dateParam === 'string' ? dateParam : '';
  if (!dateString || isNaN(Date.parse(dateString))) {
    return res.status(400).json({ error: "Data inválida." });
  }

  try {
    const schedules = await findSchedulesByDate(dateString);
    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar agendamentos para a data." });
  }
}

export async function getScheduleController(req: AuthRequest, res: Response) {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ?? "";
    const schedule = await findScheduleById(id);

    if (!schedule) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }

    return res.json(schedule);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar consulta." });
  }
}

export async function updateScheduleController(req: AuthRequest, res: Response) {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ?? "";
    const data = req.body as UpdateScheduleDto;

    const schedule = await updateSchedule(id, data);
    if (!schedule) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }

    return res.json({ message: "Consulta atualizada com sucesso.", schedule });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Erro ao atualizar consulta." });
  }
}

export async function cancelScheduleController(req: AuthRequest, res: Response) {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ?? "";
    const schedule = await cancelSchedule(id);

    if (!schedule) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }

    return res.json({ message: "Consulta cancelada com sucesso.", schedule });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao cancelar consulta." });
  }
}

export const scheduleMiddlewares = {
  authenticateJWT,
  authorizeSecretaryOrAdmin: authorizeRoles("secretario", "administrador"),
};
