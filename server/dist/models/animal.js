"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublic = toPublic;
exports.findAnimalsByCliente = findAnimalsByCliente;
exports.findAllAnimals = findAllAnimals;
exports.createAnimal = createAnimal;
const db_1 = require("../config/db");
function toPublic(animal) {
    return {
        id: animal.id,
        nome: animal.nome,
        especie: animal.especie,
        raca: animal.raca,
        idade: animal.idade,
        peso: animal.peso,
        clienteId: animal.clienteId,
        createdAt: animal.createdAt,
    };
}
async function findAnimalsByCliente(clienteId) {
    return await (0, db_1.dbAll)("SELECT * FROM animals WHERE clienteId = ? ORDER BY nome", [clienteId]);
}
async function findAllAnimals() {
    return await (0, db_1.dbAll)("SELECT * FROM animals ORDER BY nome");
}
async function createAnimal(animal) {
    const createdAt = new Date().toISOString();
    const result = await (0, db_1.dbRun)(`INSERT INTO animals (nome, especie, raca, idade, peso, clienteId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [animal.nome, animal.especie, animal.raca ?? null, animal.idade ?? null, animal.peso ?? null, animal.clienteId, createdAt]);
    return {
        id: result.lastID,
        ...animal,
        createdAt,
    };
}
//# sourceMappingURL=animal.js.map