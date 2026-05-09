import { dbGet, dbRun, dbAll } from "../config/db";

export interface AnimalBase {
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  peso?: number;
  clienteId: number;
}

export interface Animal extends AnimalBase {
  id: number;
  createdAt: string;
}

export interface AnimalPublic {
  id: number;
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  peso?: number;
  clienteId: number;
  createdAt: string;
}

export function toPublic(animal: Animal): AnimalPublic {
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

export async function findAnimalsByCliente(clienteId: number): Promise<Animal[]> {
  return await dbAll("SELECT * FROM animals WHERE clienteId = ? ORDER BY nome", [clienteId]);
}

export async function findAllAnimals(): Promise<Animal[]> {
  return await dbAll("SELECT * FROM animals ORDER BY nome");
}

export async function createAnimal(animal: AnimalBase): Promise<Animal> {
  const createdAt = new Date().toISOString();
  const result = await dbRun(
    `INSERT INTO animals (nome, especie, raca, idade, peso, clienteId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [animal.nome, animal.especie, animal.raca ?? null, animal.idade ?? null, animal.peso ?? null, animal.clienteId, createdAt]
  );

  return {
    id: result.lastID,
    ...animal,
    createdAt,
  };
}