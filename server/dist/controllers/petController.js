"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPet = createPet;
exports.listMyPets = listMyPets;
exports.getPetById = getPetById;
exports.updatePet = updatePet;
exports.deletePet = deletePet;
const express_1 = require("express");
const petModel = __importStar(require("../models/pet"));
async function createPet(req, res) {
    try {
        const { nome, especie, raca, idade, peso, dataNascimento } = req.body;
        const clienteId = req.userId; // Set by auth middleware
        // Validation
        if (!nome || !especie || !raca || !idade || !peso) {
            return res.status(400).json({
                error: "Nome, espécie, raça, idade e peso são obrigatórios",
            });
        }
        const pet = await petModel.createPet({
            nome,
            especie,
            raca,
            idade: parseFloat(idade),
            peso: parseFloat(peso),
            dataNascimento,
            clienteId,
        });
        res.status(201).json({
            message: "Pet criado com sucesso",
            pet: petModel.toPublic(pet),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao criar pet", details: error });
    }
}
async function listMyPets(req, res) {
    try {
        const clienteId = req.userId;
        const pets = await petModel.findPetsByClientId(clienteId);
        const publicPets = pets.map(petModel.toPublic);
        res.json({
            quantidade: publicPets.length,
            pets: publicPets,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao listar pets", details: error });
    }
}
async function getPetById(req, res) {
    try {
        const { id } = req.params;
        const clienteId = req.userId;
        const pet = await petModel.findPetById(parseInt(id));
        if (!pet) {
            return res.status(404).json({ error: "Pet não encontrado" });
        }
        // Verify ownership
        if (pet.clienteId !== clienteId) {
            return res.status(403).json({ error: "Acesso negado" });
        }
        res.json(petModel.toPublic(pet));
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao buscar pet", details: error });
    }
}
async function updatePet(req, res) {
    try {
        const { id } = req.params;
        const { nome, especie, raca, idade, peso, dataNascimento } = req.body;
        const clienteId = req.userId;
        const pet = await petModel.findPetById(parseInt(id));
        if (!pet) {
            return res.status(404).json({ error: "Pet não encontrado" });
        }
        // Verify ownership
        if (pet.clienteId !== clienteId) {
            return res.status(403).json({ error: "Acesso negado" });
        }
        const updates = {};
        if (nome !== undefined)
            updates.nome = nome;
        if (especie !== undefined)
            updates.especie = especie;
        if (raca !== undefined)
            updates.raca = raca;
        if (idade !== undefined)
            updates.idade = parseFloat(idade);
        if (peso !== undefined)
            updates.peso = parseFloat(peso);
        if (dataNascimento !== undefined)
            updates.dataNascimento = dataNascimento;
        const updatedPet = await petModel.updatePet(parseInt(id), updates);
        res.json({
            message: "Pet atualizado com sucesso",
            pet: petModel.toPublic(updatedPet),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao atualizar pet", details: error });
    }
}
async function deletePet(req, res) {
    try {
        const { id } = req.params;
        const clienteId = req.userId;
        const pet = await petModel.findPetById(parseInt(id));
        if (!pet) {
            return res.status(404).json({ error: "Pet não encontrado" });
        }
        // Verify ownership
        if (pet.clienteId !== clienteId) {
            return res.status(403).json({ error: "Acesso negado" });
        }
        const success = await petModel.deletePet(parseInt(id));
        if (success) {
            res.json({ message: "Pet deletado com sucesso" });
        }
        else {
            res.status(500).json({ error: "Erro ao deletar pet" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao deletar pet", details: error });
    }
}
//# sourceMappingURL=petController.js.map