import { Router, Request, Response, NextFunction } from "express";
import * as petController from "../controllers/petController";
import * as userModel from "../models/user";
import { comparePassword } from "../utils/password";

const router = Router();

// Middleware para autenticação simples (verifica se o token/userId existe)
const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Por enquanto, usamos um header simples com userId
    // Em produção, usar JWT
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    (req as any).userId = parseInt(userId);
    next();
  } catch (error) {
    res.status(401).json({ error: "Erro na autenticação" });
  }
};

// Rotas protegidas para pets
router.post("/", authenticateUser, petController.createPet);
router.get("/", authenticateUser, petController.listMyPets);
router.get("/:id", authenticateUser, petController.getPetById);
router.put("/:id", authenticateUser, petController.updatePet);
router.delete("/:id", authenticateUser, petController.deletePet);

export default router;
