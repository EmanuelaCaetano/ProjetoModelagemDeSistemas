"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbAll = exports.dbGet = exports.dbRun = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const password_1 = require("../utils/password");
const dataDir = path_1.default.join(__dirname, "../../data");
const filePath = path_1.default.join(dataDir, "database.sqlite");
fs_1.default.mkdirSync(dataDir, { recursive: true });
const db = new sqlite3_1.default.Database(filePath);
// Promisify database operations
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err)
                reject(err);
            else
                resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};
exports.dbRun = dbRun;
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
};
exports.dbGet = dbGet;
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.dbAll = dbAll;
// Initialize database
db.serialize(async () => {
    try {
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('cliente','medico','administrador')),
        telefone TEXT,
        endereco TEXT,
        crmv TEXT,
        especialidade TEXT,
        nivelAcesso TEXT,
        createdAt TEXT NOT NULL
      );
    `);
        const countResult = await (0, exports.dbGet)("SELECT COUNT(1) AS count FROM users");
        if (countResult.count === 0) {
            const seedUsers = [
                {
                    nome: "Administrador Master",
                    email: "admin@newpet.com",
                    senha: (0, password_1.hashPassword)("Admin@123"),
                    role: "administrador",
                    nivelAcesso: "total",
                },
                {
                    nome: "Dr. Veterinário",
                    email: "medico@newpet.com",
                    senha: (0, password_1.hashPassword)("Medico@123"),
                    role: "medico",
                    crmv: "CRMV-12345",
                    especialidade: "Clínica Geral",
                },
                {
                    nome: "Cliente Padrão",
                    email: "cliente@newpet.com",
                    senha: (0, password_1.hashPassword)("Cliente@123"),
                    role: "cliente",
                    telefone: "+55 11 99999-9999",
                    endereco: "Rua Exemplo, 123",
                },
            ];
            const now = new Date().toISOString();
            for (const user of seedUsers) {
                await (0, exports.dbRun)(`INSERT INTO users (nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [user.nome, user.email, user.senha, user.role, user.telefone || null, user.endereco || null, user.crmv || null, user.especialidade || null, user.nivelAcesso || null, now]);
            }
        }
    }
    catch (error) {
        console.error("Erro ao inicializar banco de dados:", error);
    }
});
exports.default = db;
//# sourceMappingURL=db.js.map