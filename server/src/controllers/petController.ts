import { Request, Response } from "express";
import * as petModel from "../models/pet";

export async function createPet(req: Request, res: Response) {
  try {
    const { nome, especie, raca, idade, peso, dataNascimento } = req.body;
    const clienteId = (req as any).userId; // Set by auth middleware

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
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar pet", details: error });
  }
}

export async function listMyPets(req: Request, res: Response) {
  try {
    const clienteId = (req as any).userId;

    const pets = await petModel.findPetsByClientId(clienteId);
    const publicPets = pets.map(petModel.toPublic);

    res.json({
      quantidade: publicPets.length,
      pets: publicPets,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar pets", details: error });
  }
}

export async function getPetById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const clienteId = (req as any).userId;

    const pet = await petModel.findPetById(parseInt(id));

    if (!pet) {
      return res.status(404).json({ error: "Pet não encontrado" });
    }

    // Verify ownership
    if (pet.clienteId !== clienteId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    res.json(petModel.toPublic(pet));
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pet", details: error });
  }
}

export async function updatePet(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nome, especie, raca, idade, peso, dataNascimento } = req.body;
    const clienteId = (req as any).userId;

    const pet = await petModel.findPetById(parseInt(id));

    if (!pet) {
      return res.status(404).json({ error: "Pet não encontrado" });
    }

    // Verify ownership
    if (pet.clienteId !== clienteId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const updates: any = {};
    if (nome !== undefined) updates.nome = nome;
    if (especie !== undefined) updates.especie = especie;
    if (raca !== undefined) updates.raca = raca;
    if (idade !== undefined) updates.idade = parseFloat(idade);
    if (peso !== undefined) updates.peso = parseFloat(peso);
    if (dataNascimento !== undefined) updates.dataNascimento = dataNascimento;

    const updatedPet = await petModel.updatePet(parseInt(id), updates);

    res.json({
      message: "Pet atualizado com sucesso",
      pet: petModel.toPublic(updatedPet!),
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar pet", details: error });
  }
}

export async function deletePet(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const clienteId = (req as any).userId;

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
    } else {
      res.status(500).json({ error: "Erro ao deletar pet" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar pet", details: error });
  }
}
