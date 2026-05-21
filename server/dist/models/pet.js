"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublic = toPublic;
exports.findPetById = findPetById;
exports.findPetsByClientId = findPetsByClientId;
exports.createPet = createPet;
exports.updatePet = updatePet;
exports.deletePet = deletePet;
const db_1 = require("../config/db");
function toPublic(pet) {
    return {
        id: pet.id,
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        idade: pet.idade,
        peso: pet.peso,
        dataNascimento: pet.dataNascimento,
        createdAt: pet.createdAt,
    };
}
async function findPetById(id) {
    return await (0, db_1.dbGet)("SELECT * FROM animals WHERE id = ?", [id]);
}
async function findPetsByClientId(clienteId) {
    return await (0, db_1.dbAll)("SELECT * FROM animals WHERE clienteId = ? ORDER BY createdAt DESC", [clienteId]);
}
async function createPet(pet) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const result = await (0, db_1.dbRun)(`INSERT INTO animals (nome, especie, raca, idade, peso, dataNascimento, clienteId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        pet.nome,
        pet.especie,
        pet.raca,
        pet.idade,
        pet.peso,
        pet.dataNascimento ?? null,
        pet.clienteId,
        createdAt,
        updatedAt
    ]);
    return {
        id: result.lastID,
        ...pet,
        createdAt,
        updatedAt,
    };
}
async function updatePet(id, updates) {
    const pet = await findPetById(id);
    if (!pet)
        return undefined;
    const updatedAt = new Date().toISOString();
    const updateFields = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(", ");
    const values = Object.values(updates);
    values.push(updatedAt, id);
    await (0, db_1.dbRun)(`UPDATE animals SET ${updateFields}, updatedAt = ? WHERE id = ?`, values);
    return {
        ...pet,
        ...updates,
        updatedAt,
    };
}
async function deletePet(id) {
    const result = await (0, db_1.dbRun)("DELETE FROM animals WHERE id = ?", [id]);
    return result.changes > 0;
}
//# sourceMappingURL=pet.js.map