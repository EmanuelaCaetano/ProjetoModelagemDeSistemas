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
        // Create users table (with secretario role included)
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('cliente','medico','administrador','secretario')),
        telefone TEXT,
        endereco TEXT,
        crmv TEXT,
        especialidade TEXT,
        nivelAcesso TEXT,
        createdAt TEXT NOT NULL
      );
    `);
        // Create animals table
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        especie TEXT NOT NULL,
        raca TEXT,
        idade REAL,
        peso REAL,
        dataNascimento TEXT,
        clienteId INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (clienteId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
        // Create appointments table
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animalId INTEGER NOT NULL,
        clienteId INTEGER NOT NULL,
        medicoId INTEGER NOT NULL,
        dataHora TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'agendada' CHECK(status IN ('agendada','confirmada','cancelada','concluida')),
        observacoes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (animalId) REFERENCES animals(id),
        FOREIGN KEY (clienteId) REFERENCES users(id),
        FOREIGN KEY (medicoId) REFERENCES users(id)
      );
    `);
        // Migration: if users table exists but does not include 'secretario', update schema
        const existingUsersTable = await (0, exports.dbGet)("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'");
        if (existingUsersTable && typeof existingUsersTable.sql === 'string' && !existingUsersTable.sql.includes('secretario')) {
            console.log('Migração: atualizando schema da tabela users para aceitar role secretario.');
            await (0, exports.dbRun)('PRAGMA foreign_keys = OFF');
            await (0, exports.dbRun)('ALTER TABLE users RENAME TO users_old');
            await (0, exports.dbRun)(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          senha TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('cliente','medico','administrador','secretario')),
          telefone TEXT,
          endereco TEXT,
          crmv TEXT,
          especialidade TEXT,
          nivelAcesso TEXT,
          createdAt TEXT NOT NULL
        );
      `);
            await (0, exports.dbRun)(`
        INSERT INTO users (id, nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt)
        SELECT id, nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt
        FROM users_old;
      `);
            await (0, exports.dbRun)('DROP TABLE users_old');
            await (0, exports.dbRun)('PRAGMA foreign_keys = ON');
        }
        // Seed users (insert or update)
        const countResult = await (0, exports.dbGet)("SELECT COUNT(1) AS count FROM users");
        const now = new Date().toISOString();
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
                nome: "Secretária Maria",
                email: "secretaria@newpet.com",
                senha: (0, password_1.hashPassword)("Secretaria@123"),
                role: "secretario",
                nivelAcesso: "parcial",
                telefone: "+55 11 88888-8888",
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
        if (!countResult || countResult.count === 0) {
            for (const user of seedUsers) {
                await (0, exports.dbRun)(`INSERT INTO users (nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(email) DO UPDATE SET
             nome = excluded.nome,
             senha = excluded.senha,
             role = excluded.role,
             telefone = excluded.telefone,
             endereco = excluded.endereco,
             crmv = excluded.crmv,
             especialidade = excluded.especialidade,
             nivelAcesso = excluded.nivelAcesso;`, [user.nome, user.email, user.senha, user.role, user.telefone || null, user.endereco || null, user.crmv || null, user.especialidade || null, user.nivelAcesso || null, now]);
            }
            // Seed pets for the default client (by email resolution)
            const seedPets = [
                {
                    nome: "Max",
                    especie: "Cão",
                    raca: "Labrador",
                    idade: 3,
                    peso: 35.5,
                    dataNascimento: "2021-05-15",
                    clienteEmail: "cliente@newpet.com",
                },
                {
                    nome: "Luna",
                    especie: "Gato",
                    raca: "Persa",
                    idade: 2,
                    peso: 4.2,
                    dataNascimento: "2022-03-20",
                    clienteEmail: "cliente@newpet.com",
                },
            ];
            for (const pet of seedPets) {
                const clienteRow = await (0, exports.dbGet)('SELECT id FROM users WHERE email = ?', [pet.clienteEmail]);
                const clienteId = clienteRow ? clienteRow.id : null;
                if (clienteId) {
                    await (0, exports.dbRun)(`INSERT INTO animals (nome, especie, raca, idade, peso, dataNascimento, clienteId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [pet.nome, pet.especie, pet.raca, pet.idade, pet.peso, pet.dataNascimento, clienteId, now, now]);
                }
            }
        }
    }
    catch (error) {
        console.error("Erro ao inicializar banco de dados:", error);
    }
});
exports.default = db;
//# sourceMappingURL=db.js.map