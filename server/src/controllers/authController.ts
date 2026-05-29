import { Request, Response } from "express";
import { createUser, findUserByEmail, toPublic, UserBase, findAllUsers, updateUser, deleteUser, findUserById } from "../models/user";
import { hashPassword } from "../utils/password";
import { signToken, verifyToken } from "../utils/jwt";
import { AuthRequest } from "../middlewares/auth";

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

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({ message: "Login realizado com sucesso.", usuario: toPublic(user), token });
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

  if (body.role !== 'cliente') {
    const authHeader = req.headers.authorization;
    const bearerToken = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (!bearerToken) {
      return res.status(403).json({ error: "Apenas administradores podem cadastrar médicos, secretários ou administradores." });
    }

    try {
      const payload = verifyToken(bearerToken);
      if (payload.role !== 'administrador') {
        return res.status(403).json({ error: "Apenas administradores podem cadastrar médicos, secretários ou administradores." });
      }
    } catch (error) {
      return res.status(403).json({ error: "Token inválido para cadastro de usuários com função especial." });
    }
  }

  try {
    const normalizedEmail = body.email.trim().toLowerCase();
    body.email = normalizedEmail;

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: "Já existe um usuário cadastrado com este e-mail." });
    }

    const user = await createUser(body);
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({ message: "Usuário cadastrado com sucesso.", usuario: toPublic(user), token });
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
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = idParam ? parseInt(idParam, 10) : NaN;
  const userData = req.body as Partial<UserBase>;

  try {
    const user = await updateUser(id, userData);
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
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = idParam ? parseInt(idParam, 10) : NaN;

  try {
    const deleted = await deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    return res.json({ message: "Usuário removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function updateProfileController(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const { nome, email, telefone, endereco } = req.body;

  try {
    // Validar email se for fornecido
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await findUserByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== req.userId) {
        return res.status(409).json({ error: "Este e-mail já está em uso." });
      }
    }

    const updatedUser = await updateUser(req.userId, {
      nome,
      email: email ? email.trim().toLowerCase() : undefined,
      telefone,
      endereco
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json({
      message: "Perfil atualizado com sucesso.",
      usuario: toPublic(updatedUser)
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
}

export async function changePasswordController(req: AuthRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const { senhaAtual, senhaNova } = req.body;

  if (!senhaAtual || !senhaNova) {
    return res.status(400).json({ error: "Senha atual e nova são obrigatórias." });
  }

  if (senhaNova.length < 6) {
    return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Verificar senha atual
    const hashedCurrentPassword = hashPassword(senhaAtual);
    if (user.senha !== hashedCurrentPassword) {
      return res.status(401).json({ error: "Senha atual incorreta." });
    }

    // Atualizar para nova senha
    const updatedUser = await updateUser(req.userId, {
      senha: senhaNova
    });

    if (!updatedUser) {
      return res.status(500).json({ error: "Erro ao alterar senha." });
    }

    return res.json({
      message: "Senha alterada com sucesso.",
      usuario: toPublic(updatedUser)
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ error: "Erro ao alterar senha." });
  }
}
