import jwt from "jsonwebtoken";
import { UserRole } from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "newpet_super_secret";
const JWT_EXPIRES_IN = "8h";

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
}
