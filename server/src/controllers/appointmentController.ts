import type { Request, Response } from "express";
import {
  createAppointment,
  findAppointmentById,
  findAppointmentByMedicoAndDate,
  findAllAppointments,
  updateAppointment,
  deleteAppointment,
  getAppointmentsWithDetails,
  getAppointmentsWithDetailsByCliente
} from "../models/appointment";
import type { AppointmentBase } from "../models/appointment";

export async function createAppointmentController(req: Request, res: Response) {
  const body = req.body as AppointmentBase;

  if (!body.animalId || !body.clienteId || !body.medicoId || !body.dataHora) {
    return res.status(400).json({ error: "Animal, cliente, médico e data/hora são obrigatórios." });
  }

  try {
    const conflict = await findAppointmentByMedicoAndDate(body.medicoId, body.dataHora);
    if (conflict) {
      return res.status(409).json({ error: "Horário indisponível para este médico." });
    }

    const appointment = await createAppointment(body);
    return res.status(201).json({ message: "Consulta agendada com sucesso.", consulta: appointment });
  } catch (error) {
    console.error("Erro ao agendar consulta:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getAppointmentsController(req: Request, res: Response) {
  try {
    const appointments = await getAppointmentsWithDetails();
    return res.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getAppointmentByIdController(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const appointment = await findAppointmentById(parseInt(id));
    if (!appointment) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }
    return res.json(appointment);
  } catch (error) {
    console.error("Erro ao buscar consulta:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getAppointmentsByClienteController(req: Request, res: Response) {
  const { clienteId } = req.params;

  try {
    const appointments = await getAppointmentsWithDetailsByCliente(parseInt(clienteId));
    return res.json(appointments);
  } catch (error) {
    console.error("Erro ao buscar consultas do cliente:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function updateAppointmentController(req: Request, res: Response) {
  const { id } = req.params;
  const appointmentData = req.body as Partial<AppointmentBase>;

  try {
    const appointmentId = parseInt(id);
    const existingAppointment = await findAppointmentById(appointmentId);
    if (!existingAppointment) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }

    const targetMedicoId = appointmentData.medicoId ?? existingAppointment.medicoId;
    const targetDataHora = appointmentData.dataHora ?? existingAppointment.dataHora;
    if (appointmentData.medicoId || appointmentData.dataHora) {
      const conflict = await findAppointmentByMedicoAndDate(targetMedicoId, targetDataHora, appointmentId);
      if (conflict) {
        return res.status(409).json({ error: "Horário indisponível para este médico." });
      }
    }

    const appointment = await updateAppointment(appointmentId, appointmentData);
    if (!appointment) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }
    return res.json({ message: "Consulta atualizada com sucesso.", consulta: appointment });
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function deleteAppointmentController(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const deleted = await deleteAppointment(parseInt(id));
    if (!deleted) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }
    return res.json({ message: "Consulta removida com sucesso." });
  } catch (error) {
    console.error("Erro ao remover consulta:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}