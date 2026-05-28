import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { ConversationContext, UserRole, ChatToolDefinition } from "../types";
import { clientChatService } from "./clientChatService";
import { adminChatService } from "./adminChatService";
import { mockChatService } from "./mockChatService";

const prisma = new PrismaClient();

const disableOpenAI =
  process.env.DISABLE_OPENAI?.toString().trim().toLowerCase() === "true";
const hasOpenAIKey =
  !disableOpenAI &&
  !!process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY.trim() !== "";

let openai: OpenAI | null = null;
if (disableOpenAI) {
  console.log("ℹ️ OpenAI desabilitado via DISABLE_OPENAI=true. Usando Mock Chat Service.");
} else if (hasOpenAIKey) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI API inicializado com sucesso");
  } catch (error) {
    console.warn("⚠️ Erro ao inicializar OpenAI, usando Mock Service:", error);
    openai = null;
  }
}

export class OpenAIChatService {
  /**
   * Processa uma mensagem do usuário através do OpenAI com function calling
   */
  async processMessage(
    userId: number = 0,
    userMessage: string,
    userRole: UserRole,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<{
    response: string;
    toolsUsed: string[];
    conversationHistory: Array<{ role: string; content: string }>;
  }> {
    // Se não houver OpenAI, usa o Mock Service
    if (!openai) {
      console.log("📢 Usando Mock Chat Service (OpenAI desabilitado ou não configurado)");
      return mockChatService.processMessage(
        userId,
        userMessage,
        userRole,
        conversationHistory
      );
    }

    try {
      // Obtém o contexto da conversa
      const context = await this.buildConversationContext(userId, userRole);

      // Adiciona a mensagem atual ao histórico
      const updatedHistory = [
        ...conversationHistory,
        { role: "user", content: userMessage },
      ];

      // Define as ferramentas disponíveis de acordo com a role
      const tools = this.getToolsForRole(userRole);
      const systemPrompt = this.getSystemPrompt(userRole, context);

      // Chamada inicial ao OpenAI
      let response;
      let toolsUsed: string[] = [];
      let assistantMessage: any = null;

      try {
        response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...updatedHistory.map((msg) => ({
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
            })),
          ],
          tools: tools as any,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 2000,
          // Timeout may be managed by underlying http client
        });

        assistantMessage = response.choices[0]?.message;
      } catch (openaiError) {
        console.error("Erro na chamada OpenAI, usando Mock como fallback:", openaiError);
        // Fallback para Mock Service em caso de erro de rede ou OpenAI
        return mockChatService.processMessage(
          userId,
          userMessage,
          userRole,
          conversationHistory
        );
      }

      // Processa tool calls se houver
      while (
        response.choices[0]?.finish_reason === "tool_calls" &&
        assistantMessage?.tool_calls
      ) {
const toolCalls: any[] = assistantMessage.tool_calls;
      toolsUsed = toolCalls
        .filter((call: any) => call.type === "function")
        .map((call: any) => {
            if (call.type === "function") {
              return call.function.name;
            }
            return "";
          });

        // Adiciona a resposta do assistente ao histórico
        updatedHistory.push({
          role: "assistant",
          content: assistantMessage.content || "",
        });

        // Executa cada tool call
        const toolResults = [];
        for (const toolCall of toolCalls) {
          if (toolCall.type !== "function") continue;

          const result = await this.executeTool(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments),
            userRole,
            userId
          );

          toolResults.push({
            tool_use_id: toolCall.id,
            content: JSON.stringify(result),
          });

          updatedHistory.push({
            role: "user",
            content: `Tool: ${toolCall.function.name}\nResult: ${JSON.stringify(result)}`,
          });
        }

        // Nova chamada ao OpenAI com os resultados das ferramentas
        try {
          response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...updatedHistory.map((msg) => ({
                role: msg.role as "user" | "assistant" | "system",
                content: msg.content,
              })),
            ],
            tools: tools as any,
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 2000,
          });

          assistantMessage = response.choices[0]?.message;
        } catch (openaiError) {
          console.error("Erro na chamada OpenAI (segunda etapa), usando Mock como fallback:", openaiError);
          return mockChatService.processMessage(
            userId,
            userMessage,
            userRole,
            conversationHistory
          );
        }
      }

      // Extrai o conteúdo final da resposta
      const finalResponse =
        assistantMessage?.content ||
        "Desculpe, não consegui processar sua solicitação.";

      // Salva a mensagem do usuário e a resposta no banco quando houver usuário válido
      if (userId > 0) {
        await this.saveChatMessages(userId, userMessage, finalResponse);
      }

      // Atualiza o histórico com a resposta final
      updatedHistory.push({
        role: "assistant",
        content: finalResponse,
      });

      return {
        response: finalResponse,
        toolsUsed,
        conversationHistory: updatedHistory,
      };
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      throw error;
    }
  }

  /**
   * Executa uma tool/função chamada pelo OpenAI
   */
  private async executeTool(
    toolName: string,
    args: Record<string, any>,
    userRole: UserRole,
    userId: number
  ): Promise<any> {
    try {
      if (userRole === "cliente") {
        return await this.executeClientTool(toolName, args, userId);
      } else if (userRole === "administrador") {
        return await this.executeAdminTool(toolName, args);
      } else {
        throw new Error(`Role não suportada: ${userRole}`);
      }
    } catch (error) {
      console.error(`Erro ao executar tool ${toolName}:`, error);
      return {
        error: true,
        message: `Erro ao executar ${toolName}: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Executa tools disponíveis para clientes
   */
  private async executeClientTool(
    toolName: string,
    args: Record<string, any>,
    userId: number
  ): Promise<any> {
    switch (toolName) {
      case "getClientPets":
        return await clientChatService.getClientPets(userId);

      case "listVeterinarians":
        return await clientChatService.listVeterinarians();

      case "findVeterinarianBySpecialty":
        return await clientChatService.findVeterinarianBySpecialty(
          args.specialty
        );

      case "getAvailableSchedules":
        return await clientChatService.getAvailableSchedules(
          args.veterinarianId,
          new Date(args.date)
        );

      case "createSchedule":
        return await clientChatService.createSchedule(
          userId,
          args.petId,
          args.veterinarianId,
          new Date(args.date),
          args.notes
        );

      case "listClientSchedules":
        return await clientChatService.listClientSchedules(userId);

      case "getScheduleDetails":
        return await clientChatService.getScheduleDetails(
          args.scheduleId,
          userId
        );

      default:
        throw new Error(`Tool desconhecida: ${toolName}`);
    }
  }

  /**
   * Executa tools disponíveis para admins
   */
  private async executeAdminTool(
    toolName: string,
    args: Record<string, any>
  ): Promise<any> {
    switch (toolName) {
      case "getSchedulesToday":
        return await adminChatService.getSchedulesToday();

      case "getSchedulesByDate":
        return await adminChatService.getSchedulesByDate(new Date(args.date));

      case "getVeterinarianStatistics":
        return await adminChatService.getVeterinarianStatistics();

      case "getCancelledSchedules":
        return await adminChatService.getCancelledSchedules(
          args.daysBack || 30
        );

      case "getAvailableTimeSlots":
        return await adminChatService.getAvailableTimeSlots(
          args.veterinarianId,
          new Date(args.date)
        );

      case "getClinicStatistics":
        return await adminChatService.getClinicStatistics();

      default:
        throw new Error(`Tool desconhecida: ${toolName}`);
    }
  }

  /**
   * Obtém o prompt do sistema conforme a role
   */
  private getSystemPrompt(userRole: UserRole, context: ConversationContext): string {
    if (userRole === "cliente") {
      return `Você é um assistente virtual de uma clínica veterinária, focado em ajudar clientes a agendar consultas para seus pets.

Seu papel é conduzir o cliente por um fluxo completo de agendamento:
1. Perguntar qual pet será atendido.
2. Perguntar qual especialidade ou tipo de atendimento o cliente deseja.
3. Consultar os veterinários disponíveis para essa especialidade.
4. Consultar os horários reais disponíveis.
5. Exibir opções reais de médicos e horários.
6. Confirmar o agendamento com o cliente antes de criar a consulta.
7. Criar a consulta no banco de dados quando a confirmação for clara.

Ferramentas disponíveis:
- getClientPets: para listar os pets do cliente.
- listVeterinarians: para listar veterinários disponíveis.
- findVeterinarianBySpecialty: para buscar veterinários por especialidade.
- getAvailableSchedules: para consultar horários livres.
- createSchedule: para criar o agendamento.
- listClientSchedules: para mostrar consultas futuras.

Importante:
- Sempre use as ferramentas para obter dados reais.
- Não invente horários, nomes de médicos ou informações.
- Se não tiver dados suficientes, peça a informação adicional ao cliente.
- Seja conversacional, educado e objetivo.

Informações do cliente:
- ID do Cliente: ${context.userId}

`;
    } else if (userRole === "administrador") {
      return `Você é um assistente administrativo inteligente de uma clínica veterinária.

Seu objetivo é ajudar administradores com:
- Consultar agendamentos
- Visualizar estatísticas
- Monitorar desempenho dos veterinários
- Identificar horários livres
- Gerar relatórios

Permissões:
- LEITURA: Sim
- MODIFICAÇÃO: Não (você não pode alterar dados)

Instruções importantes:
1. Sempre forneça dados verificados do sistema
2. Use as ferramentas para obter informações atualizadas
3. Apresente estatísticas de forma clara e objetiva
4. Nunca invente dados - use sempre as informações do sistema
5. Se o admin pedir para modificar dados, explique que isso requer acesso administrativo direto

`;
    }

    return "Você é um assistente de clínica veterinária.";
  }

  /**
   * Define as ferramentas disponíveis conforme a role
   */
  private getToolsForRole(userRole: UserRole): ChatToolDefinition[] {
    if (userRole === "cliente") {
      return this.getClientTools();
    } else if (userRole === "administrador") {
      return this.getAdminTools();
    }
    return [];
  }

  /**
   * Ferramentas disponíveis para clientes
   */
  private getClientTools(): ChatToolDefinition[] {
    return [
      {
        type: "function",
        function: {
          name: "getClientPets",
          description: "Obtém a lista de pets do cliente autenticado",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "listVeterinarians",
          description: "Lista todos os veterinários disponíveis",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "findVeterinarianBySpecialty",
          description:
            "Busca veterinários por especialidade (ex: dermatologia, cirurgia)",
          parameters: {
            type: "object",
            properties: {
              specialty: {
                type: "string",
                description: "Especialidade desejada",
              },
            },
            required: ["specialty"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getAvailableSchedules",
          description:
            "Obtém horários disponíveis para um veterinário em uma data",
          parameters: {
            type: "object",
            properties: {
              veterinarianId: {
                type: "number",
                description: "ID do veterinário",
              },
              date: {
                type: "string",
                description: "Data em formato ISO (YYYY-MM-DD)",
              },
            },
            required: ["veterinarianId", "date"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "createSchedule",
          description:
            "Cria um novo agendamento para o cliente",
          parameters: {
            type: "object",
            properties: {
              petId: {
                type: "number",
                description: "ID do pet",
              },
              veterinarianId: {
                type: "number",
                description: "ID do veterinário",
              },
              date: {
                type: "string",
                description: "Data e hora do agendamento em formato ISO",
              },
              notes: {
                type: "string",
                description: "Notas adicionais (opcional)",
              },
            },
            required: ["petId", "veterinarianId", "date"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "listClientSchedules",
          description: "Lista os agendamentos futuros do cliente",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getScheduleDetails",
          description: "Obtém detalhes completos de um agendamento específico",
          parameters: {
            type: "object",
            properties: {
              scheduleId: {
                type: "string",
                description: "ID do agendamento",
              },
            },
            required: ["scheduleId"],
          },
        },
      },
    ];
  }

  /**
   * Ferramentas disponíveis para admins
   */
  private getAdminTools(): ChatToolDefinition[] {
    return [
      {
        type: "function",
        function: {
          name: "getSchedulesToday",
          description: "Obtém todos os agendamentos de hoje",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getSchedulesByDate",
          description: "Obtém agendamentos para uma data específica",
          parameters: {
            type: "object",
            properties: {
              date: {
                type: "string",
                description: "Data em formato ISO (YYYY-MM-DD)",
              },
            },
            required: ["date"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getVeterinarianStatistics",
          description:
            "Obtém estatísticas de desempenho dos veterinários",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getCancelledSchedules",
          description:
            "Obtém agendamentos cancelados nos últimos X dias",
          parameters: {
            type: "object",
            properties: {
              daysBack: {
                type: "number",
                description: "Número de dias a considerar (padrão: 30)",
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getAvailableTimeSlots",
          description:
            "Obtém horários disponíveis para um veterinário em uma data",
          parameters: {
            type: "object",
            properties: {
              veterinarianId: {
                type: "number",
                description: "ID do veterinário",
              },
              date: {
                type: "string",
                description: "Data em formato ISO (YYYY-MM-DD)",
              },
            },
            required: ["veterinarianId", "date"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getClinicStatistics",
          description: "Obtém estatísticas gerais da clínica",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
    ];
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
      recentMessages: [],
    };
  }

  /**
   * Salva mensagens de chat no banco de dados
   */
  private async saveChatMessages(
    userId: number,
    userMessage: string,
    assistantMessage: string
  ): Promise<void> {
    try {
      await Promise.all([
        prisma.chatMessage.create({
          data: {
            userId,
            role: "user",
            message: userMessage,
          },
        }),
        prisma.chatMessage.create({
          data: {
            userId,
            role: "assistant",
            message: assistantMessage,
          },
        }),
      ]);
    } catch (error) {
      console.error("Erro ao salvar mensagens de chat:", error);
      // Não lançar erro, apenas logar
    }
  }

  /**
   * Obtém o histórico de conversa de um usuário
   */
  async getConversationHistory(userId: number, limit: number = 20) {
    try {
      if (!userId || userId <= 0) {
        return [];
      }

      const messages = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit, // Últimas N mensagens
        select: { role: true, message: true, createdAt: true },
      });

      // Retorna em ordem ascendente
      return messages
        .reverse()
        .map((msg) => ({
          role: msg.role,
          content: msg.message,
          timestamp: msg.createdAt,
        }));
    } catch (error) {
      console.error("Erro ao obter histórico de conversa:", error);
      return [];
    }
  }

  /**
   * Verifica conectividade com a OpenAI (quando configurada)
   */
  async checkOpenAIConnectivity(): Promise<{ configured: boolean; reachable: boolean; disabled: boolean; error?: string }>{
    if (disableOpenAI) {
      return { configured: false, reachable: false, disabled: true, error: "OpenAI desabilitado pelo servidor" };
    }

    if (!openai) {
      return { configured: false, reachable: false, disabled: false, error: "OPENAI_API_KEY não configurada" };
    }

    try {
      // Lista modelos como verificação leve de conectividade
      await openai.models.list();
      return { configured: true, reachable: true, disabled: false };
    } catch (error: any) {
      console.error("OpenAI connectivity check failed:", error);
      return { configured: true, reachable: false, disabled: false, error: error?.message || String(error) };
    }
  }
}

export const openAIChatService = new OpenAIChatService();
