import { PrismaClient } from "@prisma/client";
import { AvailableSchedule, ScheduleInfo, VeterinarianInfo } from "../types";

const prisma = new PrismaClient();

export class ClientChatService {
  /**
   * Obtém pets do cliente autenticado
   */
  async getClientPets(clientId: number) {
    try {
      const pets = await prisma.pet.findMany({
        where: { clienteId: clientId },
        select: {
          id: true,
          nome: true,
          especie: true,
          raca: true,
          idade: true,
          peso: true,
        },
      });
      return pets;
    } catch (error) {
      console.error("Erro ao buscar pets do cliente:", error);
      throw error;
    }
  }

  /**
   * Obtém todos os veterinários disponíveis
   */
  async listVeterinarians(): Promise<VeterinarianInfo[]> {
    try {
      const vets = await prisma.user.findMany({
        where: { role: "medico" },
        select: {
          id: true,
          nome: true,
          especialidade: true,
          crmv: true,
        },
      });
      return vets.map((vet) => ({
        id: vet.id,
        nome: vet.nome,
        especialidade: vet.especialidade || "Clínico Geral",
        crmv: vet.crmv || "N/A",
      }));
    } catch (error) {
      console.error("Erro ao listar veterinários:", error);
      throw error;
    }
  }

  /**
   * Busca veterinários por especialidade
   */
  async findVeterinarianBySpecialty(specialty: string): Promise<VeterinarianInfo[]> {
    try {
      const vets = await prisma.user.findMany({
        where: {
          role: "medico",
          especialidade: {
            contains: specialty,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          nome: true,
          especialidade: true,
          crmv: true,
        },
      });
      return vets.map((vet) => ({
        id: vet.id,
        nome: vet.nome,
        especialidade: vet.especialidade || "Clínico Geral",
        crmv: vet.crmv || "N/A",
      }));
    } catch (error) {
      console.error("Erro ao buscar veterinários por especialidade:", error);
      throw error;
    }
  }

  /**
   * Obtém horários disponíveis para uma data e veterinário
   */
  async getAvailableSchedules(
    vetId: number,
    date: Date
  ): Promise<AvailableSchedule> {
    try {
      const vet = await prisma.user.findUnique({
        where: { id: vetId, role: "medico" },
        select: {
          id: true,
          nome: true,
          especialidade: true,
          crmv: true,
        },
      });

      if (!vet) {
        throw new Error("Veterinário não encontrado");
      }

      // Busca agendamentos existentes para o veterinário nesta data
      const existingSchedules = await prisma.schedule.findMany({
        where: {
          veterinarianId: vetId,
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
      });

      // Horários de funcionamento: 08:00 às 17:00, intervalos de 30 minutos
      const timeSlots = this.generateTimeSlots(existingSchedules);

      return {
        date,
        timeSlots,
        veterinarian: {
          id: vet.id,
          nome: vet.nome,
          especialidade: vet.especialidade || "Clínico Geral",
          crmv: vet.crmv || "N/A",
        },
      };
    } catch (error) {
      console.error("Erro ao obter horários disponíveis:", error);
      throw error;
    }
  }

  /**
   * Gera horários disponíveis (08:00 às 17:00, intervalos de 30 min)
   */
  private generateTimeSlots(
    existingSchedules: any[]
  ): { time: string; available: boolean }[] {
    const slots: { time: string; available: boolean }[] = [];
    const startHour = 8;
    const endHour = 17;
    const interval = 30; // minutos

    const usedTimes = existingSchedules.map((schedule) => {
      const hours = schedule.date.getHours();
      const minutes = schedule.date.getMinutes();
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    });

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        slots.push({
          time,
          available: !usedTimes.includes(time),
        });
      }
    }

    return slots;
  }

  /**
   * Cria um novo agendamento
   */
  async createSchedule(
    clientId: number,
    petId: number,
    vetId: number,
    scheduledDate: Date,
    notes?: string
  ) {
    try {
      // Validação: confirma que o pet pertence ao cliente
      const pet = await prisma.pet.findFirst({
        where: { id: petId, clienteId: clientId },
      });

      if (!pet) {
        throw new Error("Pet não encontrado ou não pertence ao cliente");
      }

      // Validação: confirma que o slot não está ocupado
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          veterinarianId: vetId,
          date: scheduledDate,
        },
      });

      if (existingSchedule) {
        throw new Error("Este horário já está ocupado");
      }

      const schedule = await prisma.schedule.create({
        data: {
          clientId,
          petId,
          veterinarianId: vetId,
          date: scheduledDate,
          notes: notes || "",
          status: "scheduled",
        },
        include: {
          client: { select: { nome: true, email: true } },
          pet: { select: { nome: true, especie: true } },
          veterinarian: {
            select: { nome: true, especialidade: true, crmv: true },
          },
        },
      });

      return schedule;
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      throw error;
    }
  }

  /**
   * Lista agendamentos futuros do cliente
   */
  async listClientSchedules(clientId: number): Promise<ScheduleInfo[]> {
    try {
      const schedules = await prisma.schedule.findMany({
        where: {
          clientId,
          date: { gte: new Date() },
          status: { not: "cancelled" },
        },
        include: {
          pet: { select: { nome: true } },
          veterinarian: {
            select: { nome: true, especialidade: true },
          },
        },
        orderBy: { date: "asc" },
      });

      return schedules.map((schedule) => ({
        id: schedule.id,
        clientId: schedule.clientId,
        petId: schedule.petId,
        veterinarianId: schedule.veterinarianId,
        date: schedule.date,
        status: schedule.status,
        petName: schedule.pet.nome,
        veterinarianName: schedule.veterinarian.nome,
        veterinarianSpecialty: schedule.veterinarian.especialidade || "Clínico Geral",
      }));
    } catch (error) {
      console.error("Erro ao listar agendamentos do cliente:", error);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um agendamento específico
   */
  async getScheduleDetails(scheduleId: string, clientId: number) {
    try {
      const schedule = await prisma.schedule.findFirst({
        where: { id: scheduleId, clientId },
        include: {
          client: { select: { nome: true, email: true, telefone: true } },
          pet: { select: { nome: true, especie: true, raca: true, idade: true } },
          veterinarian: {
            select: { nome: true, especialidade: true, crmv: true, email: true },
          },
        },
      });

      if (!schedule) {
        throw new Error("Agendamento não encontrado");
      }

      return schedule;
    } catch (error) {
      console.error("Erro ao obter detalhes do agendamento:", error);
      throw error;
    }
  }
}

export const clientChatService = new ClientChatService();
