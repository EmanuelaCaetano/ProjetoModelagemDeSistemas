import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../middlewares/auth";

export function validateSchedulePayload(req: AuthRequest, res: Response, next: NextFunction) {
  const { clientId, petId, veterinarianId, date } = req.body;

  if (req.userRole === "cliente") {
    if (!req.userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }
    req.body.clientId = req.userId;
  }

  if (!req.body.clientId || !petId || !veterinarianId || !date) {
    return res.status(400).json({ error: "clientId, petId, veterinarianId e date são obrigatórios." });
  }

  if (isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "A data informada é inválida." });
  }

  next();
}
