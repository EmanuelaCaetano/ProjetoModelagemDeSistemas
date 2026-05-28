import { Response } from "express";
import { programmedChatService } from "../services/programmedChatService";
import { ChatMessageRequest } from "../types";
import { AuthRequest } from "../../../middlewares/auth";

export class ChatbotController {
  /**
   * Handler para chat de clientes
   */
  static async handleClientChat(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { message, command, payload } = req.body as ChatMessageRequest & {
        command?: string;
        payload?: Record<string, any>;
      };
      const userId = req.userId ?? 0;
      const userRole = "cliente";

      if (!message || typeof message !== "string" || message.trim() === "") {
        res.status(400).json({
          error: "Mensagem inválida",
          message: "A mensagem deve ser um texto não vazio",
        });
        return;
      }

      const result = await programmedChatService.processMessage(
        userId,
        command,
        payload,
        userRole as any
      );

      if (userId > 0) {
        await programmedChatService.saveChatMessages(userId, message.trim(), result.response);
      }

      res.status(200).json({
        success: true,
        data: {
          response: result.response,
          options: result.options,
          toolsUsed: result.toolsUsed,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Erro no handler de chat cliente:", error);
      res.status(500).json({
        error: "Erro interno",
        message: (error as Error).message,
      });
    }
  }

  /**
   * Handler para chat de admin
   */
  static async handleAdminChat(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { message, command, payload } = req.body as ChatMessageRequest & {
        command?: string;
        payload?: Record<string, any>;
      };
      const userId = req.userId ?? 0;
      const userRole = "administrador";

      if (!message || typeof message !== "string" || message.trim() === "") {
        res.status(400).json({
          error: "Mensagem inválida",
          message: "A mensagem deve ser um texto não vazio",
        });
        return;
      }

      const result = await programmedChatService.processMessage(
        userId,
        command,
        payload,
        userRole as any
      );

      if (userId > 0) {
        await programmedChatService.saveChatMessages(userId, message.trim(), result.response);
      }

      res.status(200).json({
        success: true,
        data: {
          response: result.response,
          options: result.options,
          toolsUsed: result.toolsUsed,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Erro no handler de chat admin:", error);
      res.status(500).json({
        error: "Erro interno",
        message: (error as Error).message,
      });
    }
  }

  /**
   * Obtém o histórico de conversa de um usuário
   */
  static async getConversationHistory(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.userId ?? 0;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      if (!userId) {
        res.status(200).json({
          success: true,
          data: {
            history: [],
            totalMessages: 0,
            limit,
          },
        });
        return;
      }

      const history = await programmedChatService.getConversationHistory(userId, limit);

      res.status(200).json({
        success: true,
        data: {
          history,
          totalMessages: history.length,
          limit,
        },
      });
    } catch (error) {
      console.error("Erro ao obter histórico:", error);
      res.status(500).json({
        error: "Erro interno",
        message: (error as Error).message,
      });
    }
  }

  /**
   * Health check do serviço de chat
   */
  static async healthCheck(req: any, res: Response): Promise<void> {
    try {
      const health = await programmedChatService.healthCheck();

      res.status(200).json({
        success: true,
        data: {
          service: "Chatbot",
          status: "healthy",
          details: health,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Erro ao verificar saúde do serviço",
        message: (error as Error).message,
      });
    }
  }
}
