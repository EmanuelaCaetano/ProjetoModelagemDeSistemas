import { Request, Response } from "express";
import { createAnimal, findAnimalsByCliente, toPublic, AnimalBase } from "../models/animal";

export async function getAnimals(req: Request, res: Response) {
  const clienteId = parseInt(req.params.clienteId);
  if (!clienteId) {
    return res.status(400).json({ error: "ID do cliente é obrigatório." });
  }

  try {
    const animals = await findAnimalsByCliente(clienteId);
    return res.json(animals.map(toPublic));
  } catch (error) {
    console.error("Erro ao buscar animais:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function registerAnimal(req: Request, res: Response) {
  const body = req.body as AnimalBase;

  if (!body.nome || !body.especie || !body.clienteId) {
    return res.status(400).json({ error: "Nome, espécie e ID do cliente são obrigatórios." });
  }

  try {
    const animal = await createAnimal(body);
    return res.status(201).json({ message: "Animal cadastrado com sucesso.", animal: toPublic(animal) });
  } catch (error) {
    console.error("Erro no cadastro do animal:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}