import { Request, Response } from "express";
import { createUser, findUserByEmail, toPublic, UserBase } from "../models/user";
import { hashPassword } from "../utils/password";

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body as { email?: string; senha?: string };
  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    const user = await findUserByEmail(email);
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
    const existingUser = await findUserByEmail(body.email);
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
