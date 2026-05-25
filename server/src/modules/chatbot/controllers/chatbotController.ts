import { Response, NextFunction } from "express";
import { openAIChatService } from "../services/openAIChatService";
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
      const { message } = req.body as ChatMessageRequest;
      const userId = req.userId;
      const userRole = req.userRole || "cliente";

      // Validações
      if (!message || typeof message !== "string" || message.trim() === "") {
        res.status(400).json({
          error: "Mensagem inválida",
          message: "A mensagem deve ser um texto não vazio",
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          error: "Não autenticado",
          message: "Usuário não autenticado",
        });
        return;
      }

      if (userRole !== "cliente") {
        res.status(403).json({
          error: "Acesso negado",
          message: "Este endpoint é apenas para clientes",
        });
        return;
      }

      // Processa a mensagem através do OpenAI
      const result = await openAIChatService.processMessage(
        userId,
        message.trim(),
        userRole as any,
        [] // Começar com histórico vazio ou buscar do DB
      );

      res.status(200).json({
        success: true,
        data: {
          response: result.response,
          toolsUsed: result.toolsUsed,
          timestamp: new Date(),
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
      const { message } = req.body as ChatMessageRequest;
      const userId = req.userId;
      const userRole = req.userRole || "administrador";

      // Validações
      if (!message || typeof message !== "string" || message.trim() === "") {
        res.status(400).json({
          error: "Mensagem inválida",
          message: "A mensagem deve ser um texto não vazio",
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          error: "Não autenticado",
          message: "Usuário não autenticado",
        });
        return;
      }

      if (userRole !== "administrador") {
        res.status(403).json({
          error: "Acesso negado",
          message: "Este endpoint é apenas para administradores",
        });
        return;
      }

      // Processa a mensagem através do OpenAI
      const result = await openAIChatService.processMessage(
        userId,
        message.trim(),
        userRole as any,
        []
      );

      res.status(200).json({
        success: true,
        data: {
          response: result.response,
          toolsUsed: result.toolsUsed,
          timestamp: new Date(),
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
      const userId = req.userId;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      if (!userId) {
        res.status(401).json({
          error: "Não autenticado",
          message: "Usuário não autenticado",
        });
        return;
      }

      const history = await openAIChatService.getConversationHistory(
        userId,
        limit
      );

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
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

      res.status(200).json({
        success: true,
        data: {
          service: "Chatbot",
          status: "healthy",
          openAI: {
            configured: hasOpenAIKey,
          },
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
