import { dbAll, dbGet } from "../../../config/db";
import { createSchedule, findAvailableSchedules, findSchedulesByClient, cancelSchedule } from "../../schedules/services/schedule.service";
import { UserRole } from "../types";

type ChatOption = {
  label: string;
  command: string;
  payload?: Record<string, any>;
};

export class ProgrammedChatService {
  async processMessage(
    userId: number,
    command: string | undefined,
    payload: Record<string, any> | undefined,
    userRole: UserRole
  ) {
    const normalizedCommand = command?.toString().trim().toUpperCase();
    switch (normalizedCommand) {
      case "BOOK_APPOINTMENT":
      case "AGENDAR_CONSULTA":
        return this.startBooking(userId);
      case "VIEW_APPOINTMENTS":
      case "MINHAS_CONSULTAS":
        return this.showClientSchedules(userId);
      case "CANCEL_APPOINTMENT":
      case "CANCELAR_CONSULTA":
        return this.startCancelFlow(userId);
      case "SELECT_PET":
        return this.handleSelectPet(userId, payload);
      case "SELECT_SPECIALTY":
        return this.handleSelectSpecialty(userId, payload);
      case "SELECT_VETERINARIAN":
        return this.handleSelectVeterinarian(userId, payload);
      case "SELECT_DATE":
        return this.handleSelectDate(userId, payload);
      case "SELECT_TIME":
        return this.handleSelectTime(userId, payload);
      case "CONFIRM_BOOKING":
        return this.handleConfirmBooking(userId, payload);
      case "SELECT_CANCEL_SCHEDULE":
        return this.handleSelectCancelSchedule(userId, payload);
      case "CONFIRM_CANCEL":
        return this.handleConfirmCancel(userId, payload);
      default:
        if (userRole === "cliente") {
          return this.buildClientWelcome();
        }
        return this.buildAdminWelcome();
    }
  }

  async getConversationHistory(userId: number, limit: number = 20) {
    if (!userId || userId <= 0) return [];

    const rows = await dbAll(
      `SELECT role, message, createdAt FROM chatMessage WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`,
      [userId, limit]
    );

    return rows
      .reverse()
      .map((row) => ({ role: row.role, content: row.message, timestamp: new Date(row.createdAt) }));
  }

  async saveChatMessages(userId: number, userMessage: string, assistantMessage: string) {
    const now = new Date().toISOString();
    await dbAll(
      `INSERT INTO chatMessage (id, userId, role, message, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), userId, "user", userMessage, now]
    );
    await dbAll(
      `INSERT INTO chatMessage (id, userId, role, message, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), userId, "assistant", assistantMessage, now]
    );
  }

  async healthCheck() {
    return { status: "healthy", timestamp: new Date() };
  }

  private buildClientWelcome() {
    return {
      response: "Como posso ajudar? Escolha uma opção para avançar:",
      options: [
        { label: "Agendar Consulta", command: "BOOK_APPOINTMENT" },
        { label: "Ver Minhas Consultas", command: "VIEW_APPOINTMENTS" },
        { label: "Cancelar Consulta", command: "CANCEL_APPOINTMENT" },
      ],
      toolsUsed: [],
    };
  }

  private buildAdminWelcome() {
    return {
      response: "Olá! O que você deseja consultar hoje?",
      options: [
        { label: "Agendamentos de Hoje", command: "VIEW_TODAYS_SCHEDULES" },
        { label: "Consultar Cancelamentos", command: "VIEW_CANCELLED" },
        { label: "Ver Estatísticas da Clínica", command: "VIEW_STATS" },
      ],
      toolsUsed: [],
    };
  }

  private async startBooking(userId: number) {
    const pets = await this.getClientPets(userId);
    if (pets.length === 0) {
      return {
        response: "Você ainda não possui pets cadastrados. Por favor, crie um pet antes de agendar uma consulta.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    return {
      response: "Selecione o pet para o qual deseja agendar a consulta:",
      options: pets.map((pet) => ({
        label: `${pet.nome} (${pet.especie})`,
        command: "SELECT_PET",
        payload: { petId: pet.id, petName: pet.nome },
      })),
      toolsUsed: ["getClientPets"],
    };
  }

  private async handleSelectPet(userId: number, payload: any) {
    if (!payload?.petId) {
      return {
        response: "Pet inválido. Selecione um pet válido.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    const specialties = await this.getSpecialties();
    if (specialties.length === 0) {
      return {
        response: "No momento não há veterinários cadastrados.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: ["listVeterinarians"],
      };
    }

    return {
      response: `Ótimo! Agora escolha a especialidade para o pet ${payload.petName}:`,
      options: specialties.map((spec) => ({
        label: spec,
        command: "SELECT_SPECIALTY",
        payload: { ...payload, specialty: spec },
      })),
      toolsUsed: ["listVeterinarians"],
    };
  }

  private async handleSelectSpecialty(userId: number, payload: any) {
    if (!payload?.petId || !payload?.specialty) {
      return {
        response: "Especialidade inválida. Tente novamente.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    const veterinarians = await this.findVeterinariansBySpecialty(payload.specialty);
    if (veterinarians.length === 0) {
      return {
        response: `Não há veterinários disponíveis para ${payload.specialty}. Escolha outra especialidade ou volte ao menu inicial.`,
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: ["findVeterinarianBySpecialty"],
      };
    }

    return {
      response: `Selecione o veterinário para a especialidade ${payload.specialty}:`,
      options: veterinarians.map((vet) => ({
        label: `Dr(a). ${vet.nome} (${vet.especialidade || "Clínica Geral"})`,
        command: "SELECT_VETERINARIAN",
        payload: {
          ...payload,
          veterinarianId: vet.id,
          veterinarianName: vet.nome,
        },
      })),
      toolsUsed: ["findVeterinarianBySpecialty"],
    };
  }

  private async handleSelectVeterinarian(userId: number, payload: any) {
    if (!payload?.petId || !payload?.veterinarianId || !payload?.specialty) {
      return {
        response: "Veterinário inválido. Selecione novamente.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    const days = this.getNextSevenDays();
    return {
      response: `Agora escolha a data da consulta com Dr(a). ${payload.veterinarianName}:`,
      options: days.map((day) => ({
        label: `${day.label}`,
        command: "SELECT_DATE",
        payload: {
          ...payload,
          date: day.value,
        },
      })),
      toolsUsed: [],
    };
  }

  private async handleSelectDate(userId: number, payload: any) {
    if (!payload?.petId || !payload?.veterinarianId || !payload?.date || !payload?.veterinarianName) {
      return {
        response: "Data inválida. Por favor, selecione uma data novamente.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    const availability = await findAvailableSchedules(payload.veterinarianId, payload.date);
    const availableTimes = availability.timeSlots.filter((slot) => slot.available);
    if (availableTimes.length === 0) {
      return {
        response: `Não há horários disponíveis para Dr(a). ${payload.veterinarianName} em ${payload.date}. Escolha outra data ou médico.`,
        options: [
          { label: "Escolher outra data", command: "SELECT_VETERINARIAN", payload },
          { label: "Voltar ao menu", command: "INIT" },
        ],
        toolsUsed: ["getAvailableSchedules"],
      };
    }

    return {
      response: `Selecione o horário disponível para ${payload.date}:`,
      options: availableTimes.map((slot) => ({
        label: slot.time,
        command: "SELECT_TIME",
        payload: {
          ...payload,
          time: slot.time,
        },
      })),
      toolsUsed: ["getAvailableSchedules"],
    };
  }

  private async handleSelectTime(userId: number, payload: any) {
    if (!payload?.petId || !payload?.veterinarianId || !payload?.date || !payload?.time || !payload?.veterinarianName) {
      return {
        response: "Horário inválido. Por favor, selecione novamente.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    return {
      response: `Confirmar agendamento para ${payload.petName} com Dr(a). ${payload.veterinarianName} em ${payload.date} às ${payload.time}?`,
      options: [
        {
          label: "Confirmar Agendamento",
          command: "CONFIRM_BOOKING",
          payload,
        },
        {
          label: "Cancelar",
          command: "INIT",
        },
      ],
      toolsUsed: [],
    };
  }

  private async handleConfirmBooking(userId: number, payload: any) {
    if (!payload?.petId || !payload?.veterinarianId || !payload?.date || !payload?.time) {
      return {
        response: "Dados incompletos para confirmar o agendamento.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    try {
      const scheduleDate = new Date(`${payload.date}T${payload.time}:00`);
      const schedule = await createSchedule({
        clientId: userId,
        petId: Number(payload.petId),
        veterinarianId: Number(payload.veterinarianId),
        date: scheduleDate.toISOString(),
        notes: payload.notes || "",
      });

      return {
        response: `Consulta confirmada! \n
Pet: ${payload.petName}\nMédico: Dr(a). ${payload.veterinarianName}\nData e horário: ${new Date(schedule.date).toLocaleString('pt-BR')}\n
Sua consulta foi agendada com sucesso!`,
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: ["createSchedule"],
      };
    } catch (error: any) {
      return {
        response: `Não foi possível agendar a consulta: ${error.message || error}. Por favor, tente outro horário ou médico.`,
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: ["createSchedule"],
      };
    }
  }

  private async handleSelectCancelSchedule(userId: number, payload: any) {
    if (!payload?.scheduleId) {
      return {
        response: "Seleção de consulta inválida.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    return {
      response: "Tem certeza que deseja cancelar esta consulta?",
      options: [
        {
          label: "Sim, cancelar",
          command: "CONFIRM_CANCEL",
          payload,
        },
        {
          label: "Não, voltar ao menu",
          command: "INIT",
        },
      ],
      toolsUsed: [],
    };
  }

  private async handleConfirmCancel(userId: number, payload: any) {
    if (!payload?.scheduleId) {
      return {
        response: "Id da consulta inválido.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: [],
      };
    }

    try {
      const canceled = await cancelSchedule(payload.scheduleId);
      if (!canceled) {
        return {
          response: "Não foi possível cancelar a consulta. Verifique se ainda está disponível para cancelamento.",
          options: [{ label: "Voltar ao menu", command: "INIT" }],
          toolsUsed: ["cancelSchedule"],
        };
      }

      return {
        response: "Consulta cancelada com sucesso! Se precisar agendar outra, estou aqui para ajudar.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: ["cancelSchedule"],
      };
    } catch (error: any) {
      return {
        response: `Erro ao cancelar a consulta: ${error.message || error}.`,
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: ["cancelSchedule"],
      };
    }
  }

  private async showClientSchedules(userId: number) {
    const schedules = await findSchedulesByClient(userId);
    if (!schedules || schedules.length === 0) {
      return {
        response: "Você não possui consultas futuras agendadas.",
        options: [{ label: "Agendar Consulta", command: "BOOK_APPOINTMENT" }],
        toolsUsed: ["listClientSchedules"],
      };
    }

    const list = schedules
      .map(
        (item) =>
          `• ${new Date(item.date).toLocaleString("pt-BR")} - ${item.pet?.nome} com Dr(a). ${item.veterinarian?.nome} (${item.status})`
      )
      .join("\n");

    return {
      response: `Aqui estão suas próximas consultas:\n${list}`,
      options: [
        { label: "Cancelar Consulta", command: "CANCEL_APPOINTMENT" },
        { label: "Agendar Nova Consulta", command: "BOOK_APPOINTMENT" },
      ],
      toolsUsed: ["listClientSchedules"],
    };
  }

  private async startCancelFlow(userId: number) {
    const schedules = await findSchedulesByClient(userId);
    const upcoming = schedules.filter((item) => item.status !== "cancelled");

    if (upcoming.length === 0) {
      return {
        response: "Você não possui consultas ativas para cancelar.",
        options: [{ label: "Voltar ao menu", command: "INIT" }],
        toolsUsed: ["listClientSchedules"],
      };
    }

    return {
      response: "Selecione a consulta que deseja cancelar:",
      options: upcoming.map((item) => ({
        label: `${new Date(item.date).toLocaleString("pt-BR")} - ${item.pet?.nome} com Dr(a). ${item.veterinarian?.nome}`,
        command: "SELECT_CANCEL_SCHEDULE",
        payload: { scheduleId: item.id },
      })),
      toolsUsed: ["listClientSchedules"],
    };
  }

  private async getClientPets(clientId: number) {
    return await dbAll(
      "SELECT id, nome, especie, raca FROM animals WHERE clienteId = ? ORDER BY createdAt DESC",
      [clientId]
    );
  }

  private async getSpecialties() {
    const rows = await dbAll("SELECT DISTINCT especialidade FROM users WHERE role = 'medico' AND especialidade IS NOT NULL ORDER BY especialidade ASC");
    const specialties = rows.map((row) => row.especialidade).filter(Boolean);
    return specialties.length > 0 ? specialties : ["Clínica Geral"];
  }

  private async findVeterinariansBySpecialty(specialty: string) {
    const rows = await dbAll(
      "SELECT id, nome, especialidade, crmv FROM users WHERE role = 'medico' AND (especialidade LIKE ? OR especialidade IS NULL) ORDER BY nome ASC",
      [`%${specialty}%`]
    );

    return rows.map((row) => ({
      id: row.id,
      nome: row.nome,
      especialidade: row.especialidade || "Clínica Geral",
      crmv: row.crmv || "N/A",
    }));
  }

  private getNextSevenDays() {
    const days = [];
    const today = new Date();

    for (let offset = 0; offset < 7; offset++) {
      const current = new Date(today);
      current.setDate(today.getDate() + offset);
      const label = `${current.toLocaleDateString("pt-BR", { weekday: "long" }).replace(/^./, (c) => c.toUpperCase())} - ${current.toLocaleDateString("pt-BR")}`;
      days.push({ label, value: current.toISOString().slice(0, 10) });
    }

    return days;
  }
}

export const programmedChatService = new ProgrammedChatService();
