import { Request, Response, NextFunction } from "express";

export function validateSchedulePayload(req: Request, res: Response, next: NextFunction) {
  const { clientId, petId, veterinarianId, date } = req.body;

  if (!clientId || !petId || !veterinarianId || !date) {
    return res.status(400).json({ error: "clientId, petId, veterinarianId e date são obrigatórios." });
  }

  if (isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "A data informada é inválida." });
  }

  next();
}
