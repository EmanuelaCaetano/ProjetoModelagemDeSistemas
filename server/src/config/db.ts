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

    // Create animals table
    await dbRun(`
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

      // Add seed pets for the default client (id = 3)
      const seedPets = [
        {
          nome: "Max",
          especie: "Cão",
          raca: "Labrador",
          idade: 3,
          peso: 35.5,
          dataNascimento: "2021-05-15",
          clienteId: 3,
        },
        {
          nome: "Luna",
          especie: "Gato",
          raca: "Persa",
          idade: 2,
          peso: 4.2,
          dataNascimento: "2022-03-20",
          clienteId: 3,
        },
      ];

      for (const pet of seedPets) {
        await dbRun(
          `INSERT INTO animals (nome, especie, raca, idade, peso, dataNascimento, clienteId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pet.nome, pet.especie, pet.raca, pet.idade, pet.peso, pet.dataNascimento, pet.clienteId, now, now]
        );
      }
    }
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error);
  }
});

export default db;
