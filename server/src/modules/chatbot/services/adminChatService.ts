import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AdminChatService {
  /**
   * Obtém agendamentos de hoje
   */
  async getSchedulesToday() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const schedules = await prisma.schedule.findMany({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          client: { select: { id: true, nome: true, email: true } },
          pet: { select: { nome: true, especie: true } },
          veterinarian: {
            select: { id: true, nome: true, especialidade: true },
          },
        },
        orderBy: { date: "asc" },
      });

      return {
        totalSchedules: schedules.length,
        schedules: schedules.map((s) => ({
          id: s.id,
          clientName: s.client.nome,
          petName: s.pet.nome,
          veterinarianName: s.veterinarian.nome,
          time: s.date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: s.status,
        })),
      };
    } catch (error) {
      console.error("Erro ao obter agendamentos de hoje:", error);
      throw error;
    }
  }

  /**
   * Obtém agendamentos para uma data específica
   */
  async getSchedulesByDate(targetDate: Date) {
    try {
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const schedules = await prisma.schedule.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          client: { select: { nome: true } },
          pet: { select: { nome: true, especie: true } },
          veterinarian: { select: { nome: true, especialidade: true } },
        },
        orderBy: { date: "asc" },
      });

      return {
        date: targetDate.toLocaleDateString("pt-BR"),
        totalSchedules: schedules.length,
        schedules: schedules.map((s) => ({
          time: s.date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          client: s.client.nome,
          pet: s.pet.nome,
          veterinarian: s.veterinarian.nome,
          status: s.status,
        })),
      };
    } catch (error) {
      console.error("Erro ao obter agendamentos por data:", error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas dos veterinários
   */
  async getVeterinarianStatistics() {
    try {
      const vets = await prisma.user.findMany({
        where: { role: "medico" },
        select: { id: true, nome: true, especialidade: true },
      });

      const stats = await Promise.all(
        vets.map(async (vet) => {
          const total = await prisma.schedule.count({
            where: { veterinarianId: vet.id },
          });

          const completed = await prisma.schedule.count({
            where: {
              veterinarianId: vet.id,
              status: "completed",
            },
          });

          const upcoming = await prisma.schedule.count({
            where: {
              veterinarianId: vet.id,
              date: { gte: new Date() },
              status: "scheduled",
            },
          });

          return {
            veterinarianId: vet.id,
            name: vet.nome,
            specialty: vet.especialidade || "Clínico Geral",
            totalAppointments: total,
            completedAppointments: completed,
            upcomingAppointments: upcoming,
            averageAppointmentsPerMonth:
              total > 0 ? (total / 12).toFixed(2) : 0,
          };
        })
      );

      return stats.sort(
        (a, b) => b.totalAppointments - a.totalAppointments
      );
    } catch (error) {
      console.error("Erro ao obter estatísticas dos veterinários:", error);
      throw error;
    }
  }

  /**
   * Obtém agendamentos cancelados
   */
  async getCancelledSchedules(daysBack: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const cancelled = await prisma.schedule.findMany({
        where: {
          status: "cancelled",
          createdAt: { gte: startDate },
        },
        include: {
          client: { select: { nome: true } },
          pet: { select: { nome: true } },
          veterinarian: { select: { nome: true } },
        },
        orderBy: { updatedAt: "desc" },
      });

      return {
        period: `${daysBack} dias`,
        totalCancelled: cancelled.length,
        schedules: cancelled.map((s) => ({
          id: s.id,
          clientName: s.client.nome,
          petName: s.pet.nome,
          veterinarianName: s.veterinarian.nome,
          originalDate: s.date.toLocaleDateString("pt-BR"),
          cancelledAt: s.updatedAt.toLocaleDateString("pt-BR"),
        })),
      };
    } catch (error) {
      console.error("Erro ao obter agendamentos cancelados:", error);
      throw error;
    }
  }

  /**
   * Obtém horários livres em um dia específico para um veterinário
   */
  async getAvailableTimeSlots(vetId: number, targetDate: Date) {
    try {
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const vet = await prisma.user.findUnique({
        where: { id: vetId },
        select: { nome: true, especialidade: true },
      });

      if (!vet) {
        throw new Error("Veterinário não encontrado");
      }

      const existingSchedules = await prisma.schedule.findMany({
        where: {
          veterinarianId: vetId,
          date: { gte: startDate, lt: endDate },
        },
      });

      const usedTimes = existingSchedules.map((s) => {
        const hours = s.date.getHours();
        const minutes = s.date.getMinutes();
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      });

      const allSlots = this.generateAllTimeSlots();
      const availableSlots = allSlots.filter(
        (slot) => !usedTimes.includes(slot)
      );

      return {
        veterinarian: vet.nome,
        specialty: vet.especialidade || "Clínico Geral",
        date: targetDate.toLocaleDateString("pt-BR"),
        totalSlots: allSlots.length,
        availableSlots: availableSlots.length,
        occupiedSlots: usedTimes.length,
        availableTimes: availableSlots,
      };
    } catch (error) {
      console.error("Erro ao obter horários livres:", error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas gerais da clínica
   */
  async getClinicStatistics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [
        totalClients,
        totalVeterinarians,
        totalSchedules,
        todaySchedules,
        monthSchedules,
        completedSchedules,
        cancelledSchedules,
        totalPets,
      ] = await Promise.all([
        prisma.user.count({ where: { role: "cliente" } }),
        prisma.user.count({ where: { role: "medico" } }),
        prisma.schedule.count(),
        prisma.schedule.count({
          where: {
            date: { gte: today, lt: new Date(today.getTime() + 86400000) },
          },
        }),
        prisma.schedule.count({
          where: { date: { gte: thisMonth } },
        }),
        prisma.schedule.count({ where: { status: "completed" } }),
        prisma.schedule.count({ where: { status: "cancelled" } }),
        prisma.pet.count(),
      ]);

      return {
        totalClients,
        totalVeterinarians,
        totalPets,
        appointments: {
          total: totalSchedules,
          today: todaySchedules,
          thisMonth: monthSchedules,
          completed: completedSchedules,
          cancelled: cancelledSchedules,
        },
        percentageCompleted: totalSchedules > 0
          ? ((completedSchedules / totalSchedules) * 100).toFixed(2)
          : 0,
        percentageCancelled: totalSchedules > 0
          ? ((cancelledSchedules / totalSchedules) * 100).toFixed(2)
          : 0,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas da clínica:", error);
      throw error;
    }
  }

  /**
   * Gera todos os horários disponíveis
   */
  private generateAllTimeSlots(): string[] {
    const slots: string[] = [];
    const startHour = 8;
    const endHour = 17;
    const interval = 30; // minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        slots.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
        );
      }
    }

    return slots;
  }
}

export const adminChatService = new AdminChatService();
