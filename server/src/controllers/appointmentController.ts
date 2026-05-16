import { Request, Response } from "express";
import {
  createAppointment,
  findAppointmentById,
  findAllAppointments,
  updateAppointment,
  deleteAppointment,
  getAppointmentsWithDetails,
  AppointmentBase
} from "../models/appointment";

export async function createAppointmentController(req: Request, res: Response) {
  const body = req.body as AppointmentBase;

  if (!body.animalId || !body.clienteId || !body.medicoId || !body.dataHora) {
    return res.status(400).json({ error: "Animal, cliente, médico e data/hora são obrigatórios." });
  }

  try {
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

export async function updateAppointmentController(req: Request, res: Response) {
  const { id } = req.params;
  const appointmentData = req.body as Partial<AppointmentBase>;

  try {
    const appointment = await updateAppointment(parseInt(id), appointmentData);
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