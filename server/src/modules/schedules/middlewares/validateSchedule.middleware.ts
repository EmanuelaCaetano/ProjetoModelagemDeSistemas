import { Request, Response, NextFunction } from "express";

export function validateSchedulePayload(req: Request, res: Response, next: NextFunction) {
  const { clientId, petId, veterinarianId, date } = req.body;
  const authenticatedClientId = (req as any).userId;
  const effectiveClientId = clientId || authenticatedClientId;

  if (!effectiveClientId || !petId || !veterinarianId || !date) {
    return res.status(400).json({ error: "clientId, petId, veterinarianId e date são obrigatórios." });
  }

  if (!clientId && authenticatedClientId) {
    req.body.clientId = authenticatedClientId;
  }

  if (isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "A data informada é inválida." });
  }

  next();
}
