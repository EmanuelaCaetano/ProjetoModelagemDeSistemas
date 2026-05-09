"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublic = toPublic;
exports.findUserByEmail = findUserByEmail;
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
    return await (0, db_1.dbGet)("SELECT * FROM users WHERE email = ?", [email]);
}
async function createUser(user) {
    const createdAt = new Date().toISOString();
    const result = await (0, db_1.dbRun)(`INSERT INTO users (nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [user.nome, user.email, (0, password_1.hashPassword)(user.senha), user.role, user.telefone ?? null, user.endereco ?? null, user.crmv ?? null, user.especialidade ?? null, user.nivelAcesso ?? null, createdAt]);
    return {
        id: result.lastID,
        ...user,
        senha: (0, password_1.hashPassword)(user.senha),
        createdAt,
    };
}
//# sourceMappingURL=user.js.map