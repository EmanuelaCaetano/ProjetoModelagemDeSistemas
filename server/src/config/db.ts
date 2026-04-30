import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { hashPassword } from "../utils/password";

const dataDir = path.join(__dirname, "../../data");
const filePath = path.join(dataDir, "database.sqlite");
fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(filePath);

// Promisify database operations
export const dbRun = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database
db.serialize(async () => {
  try {
    await dbRun(`
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

    const countResult = await dbGet("SELECT COUNT(1) AS count FROM users");
    if (countResult.count === 0) {
      const seedUsers = [
        {
          nome: "Administrador Master",
          email: "admin@newpet.com",
          senha: hashPassword("Admin@123"),
          role: "administrador",
          nivelAcesso: "total",
        },
        {
          nome: "Dr. Veterinário",
          email: "medico@newpet.com",
          senha: hashPassword("Medico@123"),
          role: "medico",
          crmv: "CRMV-12345",
          especialidade: "Clínica Geral",
        },
        {
          nome: "Cliente Padrão",
          email: "cliente@newpet.com",
          senha: hashPassword("Cliente@123"),
          role: "cliente",
          telefone: "+55 11 99999-9999",
          endereco: "Rua Exemplo, 123",
        },
      ];

      const now = new Date().toISOString();
      for (const user of seedUsers) {
        await dbRun(
          `INSERT INTO users (nome, email, senha, role, telefone, endereco, crmv, especialidade, nivelAcesso, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.nome, user.email, user.senha, user.role, user.telefone || null, user.endereco || null, user.crmv || null, user.especialidade || null, user.nivelAcesso || null, now]
        );
      }
    }
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error);
  }
});

export default db;
