import { dbGet, dbRun, dbAll } from "../config/db";
import { hashPassword } from "../utils/password";

export type UserRole = "cliente" | "medico" | "administrador" | "secretario";

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
  return await dbGet("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]) as User | undefined;
}

export async function findAllUsers(): Promise<User[]> {
  return await dbAll("SELECT * FROM users ORDER BY createdAt DESC") as User[];
}

export async function updateUser(id: number, userData: Partial<UserBase>): Promise<User | undefined> {
  const fields = [];
  const values = [];

  if (userData.nome) {
    fields.push("nome = ?");
    values.push(userData.nome);
  }
  if (userData.email) {
    fields.push("email = ?");
    values.push(userData.email);
  }
  if (userData.senha) {
    fields.push("senha = ?");
    values.push(hashPassword(userData.senha));
  }
  if (userData.role) {
    fields.push("role = ?");
    values.push(userData.role);
  }
  if (userData.telefone !== undefined) {
    fields.push("telefone = ?");
    values.push(userData.telefone);
  }
  if (userData.endereco !== undefined) {
    fields.push("endereco = ?");
    values.push(userData.endereco);
  }
  if (userData.crmv !== undefined) {
    fields.push("crmv = ?");
    values.push(userData.crmv);
  }
  if (userData.especialidade !== undefined) {
    fields.push("especialidade = ?");
    values.push(userData.especialidade);
  }
  if (userData.nivelAcesso !== undefined) {
    fields.push("nivelAcesso = ?");
    values.push(userData.nivelAcesso);
  }

  if (fields.length === 0) return undefined;

  values.push(id);
  await dbRun(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

  return await dbGet("SELECT * FROM users WHERE id = ?", [id]) as User;
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await dbRun("DELETE FROM users WHERE id = ?", [id]);
  return result.changes > 0;
}

export async function createUser(user: UserBase): Promise<User> {
  const createdAt = new Date().toISOString();
  const normalizedEmail = user.email.trim().toLowerCase();
  const result = await dbRun(
    `INSERT INTO users (nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.nome, normalizedEmail, hashPassword(user.senha), user.role, user.telefone ?? null, user.endereco ?? null, user.crmv ?? null, user.especialidade ?? null, user.nivelAcesso ?? null, createdAt]
  );

  return {
    id: result.lastID,
    ...user,
    email: normalizedEmail,
    senha: hashPassword(user.senha),
    createdAt,
  };
}
