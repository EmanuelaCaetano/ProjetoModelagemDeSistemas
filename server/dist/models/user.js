"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublic = toPublic;
exports.findUserByEmail = findUserByEmail;
exports.findAllUsers = findAllUsers;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.createUser = createUser;
const db_1 = require("../config/db");
const password_1 = require("../utils/password");
function toPublic(user) {
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
async function findUserByEmail(email) {
    return await (0, db_1.dbGet)("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
}
async function findAllUsers() {
    return await (0, db_1.dbAll)("SELECT * FROM users ORDER BY createdAt DESC");
}
async function updateUser(id, userData) {
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
        values.push((0, password_1.hashPassword)(userData.senha));
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
    if (fields.length === 0)
        return undefined;
    values.push(id);
    await (0, db_1.dbRun)(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
    return await (0, db_1.dbGet)("SELECT * FROM users WHERE id = ?", [id]);
}
async function deleteUser(id) {
    const result = await (0, db_1.dbRun)("DELETE FROM users WHERE id = ?", [id]);
    return result.changes > 0;
}
async function createUser(user) {
    const createdAt = new Date().toISOString();
    const normalizedEmail = user.email.trim().toLowerCase();
    const result = await (0, db_1.dbRun)(`INSERT INTO users (nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [user.nome, normalizedEmail, (0, password_1.hashPassword)(user.senha), user.role, user.telefone ?? null, user.endereco ?? null, user.crmv ?? null, user.especialidade ?? null, user.nivelAcesso ?? null, createdAt]);
    return {
        id: result.lastID,
        ...user,
        email: normalizedEmail,
        senha: (0, password_1.hashPassword)(user.senha),
        createdAt,
    };
}
//# sourceMappingURL=user.js.map