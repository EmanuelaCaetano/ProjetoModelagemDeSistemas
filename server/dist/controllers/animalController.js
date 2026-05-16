"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAnimals = getAllAnimals;
exports.getAnimals = getAnimals;
exports.registerAnimal = registerAnimal;
const express_1 = require("express");
const animal_1 = require("../models/animal");
async function getAllAnimals(req, res) {
    try {
        const animals = await (0, animal_1.findAllAnimals)();
        return res.json(animals.map(animal_1.toPublic));
    }
    catch (error) {
        console.error("Erro ao buscar animais:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function getAnimals(req, res) {
    const clienteId = parseInt(req.params.clienteId);
    if (!clienteId) {
        return res.status(400).json({ error: "ID do cliente é obrigatório." });
    }
    try {
        const animals = await (0, animal_1.findAnimalsByCliente)(clienteId);
        return res.json(animals.map(animal_1.toPublic));
    }
    catch (error) {
        console.error("Erro ao buscar animais:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
async function registerAnimal(req, res) {
    const body = req.body;
    if (!body.nome || !body.especie || !body.clienteId) {
        return res.status(400).json({ error: "Nome, espécie e ID do cliente são obrigatórios." });
    }
    try {
        const animal = await (0, animal_1.createAnimal)(body);
        return res.status(201).json({ message: "Animal cadastrado com sucesso.", animal: (0, animal_1.toPublic)(animal) });
    }
    catch (error) {
        console.error("Erro no cadastro do animal:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}
//# sourceMappingURL=animalController.js.map