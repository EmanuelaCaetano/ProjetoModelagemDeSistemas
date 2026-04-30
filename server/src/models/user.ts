import { dbGet, dbRun } from "../config/db";
import { hashPassword } from "../utils/password";

export type UserRole = "cliente" | "medico" | "administrador";

export interface UserBase {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  telefone?: string;
  endereco?: string;
  crmv?: string;
  especialidade?: string;
  nivelAcesso?: string;
}

export interface User extends UserBase {
  id: number;
  createdAt: string;
}

export interface UserPublic {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: UserRole;
  telefone?: string;
  endereco?: string;
  crmv?: string;
  especialidade?: string;
  nivelAcesso?: string;
  createdAt: string;
}

export function toPublic(user: User): UserPublic {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    tipoUsuario: user.role,
    telefone: user.telefone,
    endereco: user.endereco,
    crmv: user.crmv,
    especialidade: user.especialidade,
    nivelAcesso: user.nivelAcesso,
    createdAt: user.createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  return await dbGet("SELECT * FROM users WHERE email = ?", [email]) as User | undefined;
}

export async function createUser(user: UserBase): Promise<User> {
  const createdAt = new Date().toISOString();
  const result = await dbRun(
    `INSERT INTO users (nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.nome, user.email, hashPassword(user.senha), user.role, user.telefone ?? null, user.endereco ?? null, user.crmv ?? null, user.especialidade ?? null, user.nivelAcesso ?? null, createdAt]
  );

  return {
    id: result.lastID,
    ...user,
    senha: hashPassword(user.senha),
    createdAt,
  };
}
