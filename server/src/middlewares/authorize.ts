import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Permissão insuficiente." });
    }

    next();
  };
}
