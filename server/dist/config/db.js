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
        raca TEXT NOT NULL,
        idade REAL NOT NULL,
        peso REAL NOT NULL,
        dataNascimento TEXT,
        clienteId INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (clienteId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
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
        await (0, exports.dbRun)(`
      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        clientId INTEGER NOT NULL,
        petId INTEGER,
        veterinarianId INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','cancelled','completed')),
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (clientId) REFERENCES users(id),
        FOREIGN KEY (petId) REFERENCES animals(id),
        FOREIGN KEY (veterinarianId) REFERENCES users(id)
      );
    `);
        await (0, exports.dbRun)(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_schedules_veterinarian_date
      ON schedules(veterinarianId, date);
    `);
        const existingUsersTable = await (0, exports.dbGet)("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'");
        if (existingUsersTable && typeof existingUsersTable.sql === 'string' && !existingUsersTable.sql.includes("'secretario'")) {
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
        const scheduleSchema = await (0, exports.dbAll)("PRAGMA table_info('schedules')");
        const petIdColumn = scheduleSchema.find((column) => column.name === 'petId');
        if (petIdColumn && petIdColumn.notnull === 1) {
            console.log('Migração: atualizando schema da tabela schedules para permitir petId nulo.');
            await (0, exports.dbRun)('PRAGMA foreign_keys = OFF');
            await (0, exports.dbRun)('ALTER TABLE schedules RENAME TO schedules_old');
            await (0, exports.dbRun)(`
        CREATE TABLE schedules (
          id TEXT PRIMARY KEY,
          clientId INTEGER NOT NULL,
          petId INTEGER,
          veterinarianId INTEGER NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','cancelled','completed')),
          notes TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY (clientId) REFERENCES users(id),
          FOREIGN KEY (petId) REFERENCES animals(id),
          FOREIGN KEY (veterinarianId) REFERENCES users(id)
        );
      `);
            await (0, exports.dbRun)(`
        INSERT INTO schedules (id, clientId, petId, veterinarianId, date, status, notes, createdAt, updatedAt)
        SELECT id, clientId, petId, veterinarianId, date, status, notes, createdAt, updatedAt
        FROM schedules_old;
      `);
            await (0, exports.dbRun)('DROP TABLE schedules_old');
            await (0, exports.dbRun)('PRAGMA foreign_keys = ON');
        }
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
        const now = new Date().toISOString();
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
           nivelAcesso = excluded.nivelAcesso,
           createdAt = createdAt;`, [user.nome, user.email, user.senha, user.role, user.telefone || null, user.endereco || null, user.crmv || null, user.especialidade || null, user.nivelAcesso || null, now]);
        }
    }
    catch (error) {
        console.error("Erro ao inicializar banco de dados:", error);
    }
});
exports.default = db;
//# sourceMappingURL=db.js.map