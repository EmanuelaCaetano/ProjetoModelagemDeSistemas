"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.getUsers = getUsers;
exports.updateUserController = updateUserController;
exports.deleteUserController = deleteUserController;
const user_1 = require("../models/user");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
async function login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    try {
        const user = await (0, user_1.findUserByEmail)(normalizedEmail);
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        if (user.senha !== (0, password_1.hashPassword)(senha)) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        const token = (0, jwt_1.signToken)({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return res.json({ message: "Login realizado com sucesso.", usuario: (0, user_1.toPublic)(user), token });
    }
    catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function register(req, res) {
    const body = req.body;
    if (!body.nome || !body.email || !body.senha || !body.role) {
        return res.status(400).json({ error: "Nome, e-mail, senha e tipo de usuário são obrigatórios." });
    }
    try {
        const normalizedEmail = body.email.trim().toLowerCase();
        body.email = normalizedEmail;
        const existingUser = await (0, user_1.findUserByEmail)(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ error: "Já existe um usuário cadastrado com este e-mail." });
        }
        const user = await (0, user_1.createUser)(body);
        const token = (0, jwt_1.signToken)({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        return res.status(201).json({ message: "Usuário cadastrado com sucesso.", usuario: (0, user_1.toPublic)(user), token });
    }
    catch (error) {
        console.error("Erro no registro:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function getUsers(req, res) {
    try {
        const users = await (0, user_1.findAllUsers)();
        return res.json(users.map(user_1.toPublic));
    }
    catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function updateUserController(req, res) {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    const userData = req.body;
    try {
        const user = await (0, user_1.updateUser)(id, userData);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }
        return res.json({ message: "Usuário atualizado com sucesso.", usuario: (0, user_1.toPublic)(user) });
    }
    catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function deleteUserController(req, res) {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = idParam ? parseInt(idParam, 10) : NaN;
    try {
        const deleted = await (0, user_1.deleteUser)(id);
        if (!deleted) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }
        return res.json({ message: "Usuário removido com sucesso." });
    }
    catch (error) {
        console.error("Erro ao remover usuário:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
//# sourceMappingURL=authController.js.map