import { Router } from "express";
import { ChatbotController } from "../controllers/chatbotController";
import { authenticateJWT } from "../../../middlewares/auth";

const router = Router();

/**
 * POST /chat/client
 * Endpoint para chat de clientes
 * Disponível sem autenticação, mas aceita token quando enviado
 */
router.post("/client", authenticateJWT, async (req, res) => {
  await ChatbotController.handleClientChat(req, res);
});

/**
 * POST /chat/admin
 * Endpoint para chat de administradores
 * Disponível sem autenticação, mas aceita token quando enviado
 */
router.post("/admin", authenticateJWT, async (req, res) => {
  await ChatbotController.handleAdminChat(req, res);
});

/**
 * GET /chat/history
 * Obtém o histórico de conversa do usuário
 * Disponível sem autenticação quando não há usuário logado
 */
router.get("/history", authenticateJWT, async (req, res) => {
  await ChatbotController.getConversationHistory(req, res);
});

/**
 * GET /chat/health
 * Health check do serviço de chat
 */
router.get("/health", async (req, res) => {
  await ChatbotController.healthCheck(req, res);
});

export default router;
