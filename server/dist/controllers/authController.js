"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
const express_1 = require("express");
const user_1 = require("../models/user");
const password_1 = require("../utils/password");
async function login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }
    try {
        const user = await (0, user_1.findUserByEmail)(email);
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        if (user.senha !== (0, password_1.hashPassword)(senha)) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        return res.json({ message: "Login realizado com sucesso.", usuario: (0, user_1.toPublic)(user) });
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
        const existingUser = await (0, user_1.findUserByEmail)(body.email);
        if (existingUser) {
            return res.status(409).json({ error: "Já existe um usuário cadastrado com este e-mail." });
        }
        const user = await (0, user_1.createUser)(body);
        return res.status(201).json({ message: "Usuário cadastrado com sucesso.", usuario: (0, user_1.toPublic)(user) });
    }
    catch (error) {
        console.error("Erro no registro:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
//# sourceMappingURL=authController.js.map