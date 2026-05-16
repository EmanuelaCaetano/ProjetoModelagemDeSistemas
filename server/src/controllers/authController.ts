import type { Request, Response } from "express";
import { createUser, findUserByEmail, toPublic, findAllUsers, updateUser, deleteUser } from "../models/user";
import type { UserBase } from "../models/user";
import { hashPassword } from "../utils/password";

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body as { email?: string; senha?: string };
  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    if (user.senha !== hashPassword(senha)) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    return res.json({ message: "Login realizado com sucesso.", usuario: toPublic(user) });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function register(req: Request, res: Response) {
  const body = req.body as UserBase;

  if (!body.nome || !body.email || !body.senha || !body.role) {
    return res.status(400).json({ error: "Nome, e-mail, senha e tipo de usuário são obrigatórios." });
  }

  try {
    const normalizedEmail = body.email.trim().toLowerCase();
    body.email = normalizedEmail;

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: "Já existe um usuário cadastrado com este e-mail." });
    }

    const user = await createUser(body);
    return res.status(201).json({ message: "Usuário cadastrado com sucesso.", usuario: toPublic(user) });
  } catch (error) {
    console.error("Erro no registro:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await findAllUsers();
    return res.json(users.map(toPublic));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function updateUserController(req: Request, res: Response) {
  const { id } = req.params;
  const userData = req.body as Partial<UserBase>;

  try {
    const user = await updateUser(parseInt(id), userData);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    return res.json({ message: "Usuário atualizado com sucesso.", usuario: toPublic(user) });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function deleteUserController(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const deleted = await deleteUser(parseInt(id));
    if (!deleted) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    return res.json({ message: "Usuário removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
