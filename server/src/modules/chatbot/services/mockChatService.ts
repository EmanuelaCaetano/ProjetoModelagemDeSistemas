import { PrismaClient } from "@prisma/client";
import { ConversationContext, UserRole } from "../types";
import { clientChatService } from "./clientChatService";
import { adminChatService } from "./adminChatService";

const prisma = new PrismaClient();

/**
 * Serviço Mock para o OpenAI - Funciona sem API Key
 * Simula respostas inteligentes baseadas em dados reais do sistema
 */
export class MockChatService {
  /**
   * Processa uma mensagem do usuário usando respostas simuladas
   */
  async processMessage(
    userId: number,
    userMessage: string,
    userRole: UserRole,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<{
    response: string;
    toolsUsed: string[];
    conversationHistory: Array<{ role: string; content: string }>;
  }> {
    try {
      const context = await this.buildConversationContext(userId, userRole);
      const updatedHistory = [
        ...conversationHistory,
        { role: "user", content: userMessage },
      ];

      // Detecta a intenção do usuário e executa a lógica apropriada
      let response = "";
      let toolsUsed: string[] = [];

      const lowerMessage = userMessage.toLowerCase();

      if (userRole === "cliente") {
        // Lógica para clientes
        if (
          lowerMessage.includes("pet") ||
          lowerMessage.includes("animal") ||
          lowerMessage.includes("meus")
        ) {
          const pets = await clientChatService.getClientPets(userId);
          response = this.generateClientResponse(
            "pets",
            pets,
            userMessage
          );
          toolsUsed = ["getClientPets"];
        } else if (
          lowerMessage.includes("veterinário") ||
          lowerMessage.includes("medico") ||
          lowerMessage.includes("especialidade")
        ) {
          const vets = await clientChatService.listVeterinarians();
          response = this.generateClientResponse(
            "veterinarians",
            vets,
            userMessage
          );
          toolsUsed = ["listVeterinarians"];
        } else if (
          lowerMessage.includes("agendar") ||
          lowerMessage.includes("consulta") ||
          lowerMessage.includes("horário") ||
          lowerMessage.includes("marcar")
        ) {
          const schedules = await clientChatService.listClientSchedules(userId);
          response = this.generateClientResponse(
            "schedules",
            schedules,
            userMessage
          );
          toolsUsed = ["listClientSchedules"];
        } else {
          response = this.generateClientResponse("general", {}, userMessage);
        }
      } else if (userRole === "administrador") {
        // Lógica para administradores
        if (
          lowerMessage.includes("agendamento") ||
          lowerMessage.includes("consulta") ||
          lowerMessage.includes("hoje")
        ) {
          const todaySchedules = await adminChatService.getSchedulesToday();
          response = this.generateAdminResponse(
            "schedules_today",
            todaySchedules,
            userMessage
          );
          toolsUsed = ["getSchedulesToday"];
        } else if (
          lowerMessage.includes("veterinário") ||
          lowerMessage.includes("estatística") ||
          lowerMessage.includes("medico")
        ) {
          const vetStats = await adminChatService.getVeterinarianStatistics();
          response = this.generateAdminResponse(
            "vet_statistics",
            vetStats,
            userMessage
          );
          toolsUsed = ["getVeterinarianStatistics"];
        } else if (
          lowerMessage.includes("cancelado") ||
          lowerMessage.includes("cancelada")
        ) {
          const cancelled = await adminChatService.getCancelledSchedules(30);
          response = this.generateAdminResponse(
            "cancelled_schedules",
            cancelled,
            userMessage
          );
          toolsUsed = ["getCancelledSchedules"];
        } else if (
          lowerMessage.includes("estatística") ||
          lowerMessage.includes("relatório") ||
          lowerMessage.includes("clínica")
        ) {
          const clinicStats = await adminChatService.getClinicStatistics();
          response = this.generateAdminResponse(
            "clinic_statistics",
            clinicStats,
            userMessage
          );
          toolsUsed = ["getClinicStatistics"];
        } else {
          response = this.generateAdminResponse(
            "general",
            {},
            userMessage
          );
        }
      }

      // Salva as mensagens no banco
      await this.saveChatMessages(userId, userMessage, response);

      updatedHistory.push({
        role: "assistant",
        content: response,
      });

      return {
        response,
        toolsUsed,
        conversationHistory: updatedHistory,
      };
    } catch (error) {
      console.error("Erro ao processar mensagem (Mock):", error);
      throw error;
    }
  }

  /**
   * Gera respostas para clientes baseadas no contexto
   */
  private generateClientResponse(
    type: string,
    data: any,
    userMessage: string
  ): string {
    switch (type) {
      case "pets": {
        const pets = Array.isArray(data) ? data : [];
        if (pets.length === 0) {
          return "Você não possui nenhum pet registrado. Gostaria de adicionar um novo pet ao sistema?";
        }
        const petsList = pets
          .map((p) => `• ${p.name} (${p.species}, ${p.breed})`)
          .join("\n");
        return `Aqui estão seus pets:\n${petsList}\n\nCom qual pet você gostaria de agendar uma consulta?`;
      }

      case "veterinarians": {
        const vets = Array.isArray(data) ? data : [];
        if (vets.length === 0) {
          return "Desculpe, não há veterinários disponíveis no momento.";
        }
        const vetsList = vets
          .map((v) => `• Dr(a). ${v.name} - ${v.specialty}`)
          .join("\n");
        return `Temos os seguintes veterinários disponíveis:\n${vetsList}\n\nQual especialidade você procura?`;
      }

      case "schedules": {
        const schedules = Array.isArray(data) ? data : [];
        if (schedules.length === 0) {
          return "Você não possui nenhuma consulta agendada. Gostaria de marcar uma nova?";
        }
        const schedulesList = schedules
          .map((s) => `• ${s.date} - ${s.pet_name} com Dr(a). ${s.veterinarian_name}`)
          .join("\n");
        return `Suas próximas consultas:\n${schedulesList}\n\nNecesita de algo mais?`;
      }

      default:
        return "Olá! 👋 Bem-vindo ao assistente de agendamentos da clínica veterinária. Como posso ajudá-lo hoje? Você pode:\n• Marcar uma consulta\n• Listar seus pets\n• Ver suas consultas agendadas\n• Encontrar um veterinário especializado";
    }
  }

  /**
   * Gera respostas para administradores baseadas no contexto
   */
  private generateAdminResponse(
    type: string,
    data: any,
    userMessage: string
  ): string {
    switch (type) {
      case "schedules_today": {
        const count = data?.count || 0;
        const schedules = data?.schedules || [];
        const schedulesList = schedules
          .slice(0, 5)
          .map((s) => `• ${s.time} - ${s.pet_name} (Dr(a). ${s.veterinarian_name})`)
          .join("\n");
        return `📅 **Agendamentos de Hoje**\n\nTotal: ${count} consulta${count !== 1 ? "s" : ""}\n\nPróximas consultas:\n${schedulesList}${schedules.length > 5 ? `\n... e mais ${schedules.length - 5}` : ""}`;
      }

      case "vet_statistics": {
        const stats = data || {};
        const statsList = Object.entries(stats)
          .map(([name, info]: [string, any]) => `• ${name}: ${info?.appointments || 0} consultas`)
          .join("\n");
        return `📊 **Estatísticas dos Veterinários**\n\n${statsList || "Nenhum dado disponível no momento."}`;
      }

      case "cancelled_schedules": {
        const cancelled = Array.isArray(data) ? data : [];
        if (cancelled.length === 0) {
          return "✅ Nenhuma consulta foi cancelada nos últimos 30 dias.";
        }
        const cancelledList = cancelled
          .slice(0, 5)
          .map((s) => `• ${s.date} - ${s.pet_name} (Motivo: ${s.cancellation_reason || "Não informado"})`)
          .join("\n");
        return `❌ **Consultas Canceladas (últimos 30 dias)**\n\nTotal: ${cancelled.length}\n\n${cancelledList}${cancelled.length > 5 ? `\n... e mais ${cancelled.length - 5}` : ""}`;
      }

      case "clinic_statistics": {
        const stats = data || {};
        return `📈 **Estatísticas da Clínica**\n\n• Total de consultas: ${stats.totalAppointments || 0}\n• Consultas este mês: ${stats.appointmentsThisMonth || 0}\n• Taxa de cancelamento: ${stats.cancellationRate || "0"}%\n• Clientes ativos: ${stats.activeClients || 0}`;
      }

      default:
        return "Olá! 👋 Bem-vindo ao assistente administrativo. Como posso ajudá-lo?\n\nVocê pode me pedir para:\n• Listar agendamentos de hoje\n• Ver estatísticas dos veterinários\n• Consultarhistórico de cancelamentos\n• Gerar relatório da clínica";
    }
  }

  /**
   * Salva mensagens no banco de dados
   */
  private async saveChatMessages(
    userId: number,
    userMessage: string,
    assistantResponse: string
  ): Promise<void> {
    try {
      await prisma.chatMessage.create({
        data: {
          userId,
          role: "user",
          message: userMessage,
        },
      });

      await prisma.chatMessage.create({
        data: {
          userId,
          role: "assistant",
          message: assistantResponse,
        },
      });
    } catch (error) {
      console.error("Erro ao salvar mensagens:", error);
    }
  }

  /**
   * Constrói o contexto da conversa
   */
  private async buildConversationContext(
    userId: number,
    userRole: UserRole
  ): Promise<ConversationContext> {
    return {
      userId,
      userRole,
      timestamp: new Date(),
    };
  }
}

export const mockChatService = new MockChatService();
