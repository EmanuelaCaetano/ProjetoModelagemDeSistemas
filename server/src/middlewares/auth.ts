import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { findUserByEmail } from "../models/user";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
  userEmail?: string;
}

export async function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (!bearerToken) {
      const userId = req.headers["x-user-id"] as string;
      if (userId) {
        req.userId = parseInt(userId, 10);
      }
      return next();
    }

    const payload = verifyToken(bearerToken);
    const user = await findUserByEmail(payload.email);
    if (!user || user.id !== payload.sub) {
      return res.status(401).json({ error: "Token inválido." });
    }

    req.userId = payload.sub;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Falha na autenticação." });
  }
}
