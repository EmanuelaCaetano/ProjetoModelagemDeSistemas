import { dbGet, dbRun, dbAll } from "../config/db";

export interface PetBase {
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  peso: number;
  dataNascimento?: string;
  clienteId: number;
}

export interface Pet extends PetBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface PetPublic {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  peso: number;
  dataNascimento?: string;
  createdAt: string;
}

export function toPublic(pet: Pet): PetPublic {
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

export async function findPetById(id: number): Promise<Pet | undefined> {
  return await dbGet("SELECT * FROM animals WHERE id = ?", [id]) as Pet | undefined;
}

export async function findPetsByClientId(clienteId: number): Promise<Pet[]> {
  return await dbAll("SELECT * FROM animals WHERE clienteId = ? ORDER BY createdAt DESC", [clienteId]) as Pet[];
}

export async function createPet(pet: PetBase): Promise<Pet> {
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  
  const result = await dbRun(
    `INSERT INTO animals (nome, especie, raca, idade, peso, dataNascimento, clienteId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pet.nome,
      pet.especie,
      pet.raca,
      pet.idade,
      pet.peso,
      pet.dataNascimento ?? null,
      pet.clienteId,
      createdAt,
      updatedAt
    ]
  );

  return {
    id: result.lastID,
    ...pet,
    createdAt,
    updatedAt,
  };
}

export async function updatePet(id: number, updates: Partial<PetBase>): Promise<Pet | undefined> {
  const pet = await findPetById(id);
  if (!pet) return undefined;

  const updatedAt = new Date().toISOString();
  const updateFields = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(", ");
  
  const values = Object.values(updates);
  values.push(updatedAt, id);

  await dbRun(
    `UPDATE animals SET ${updateFields}, updatedAt = ? WHERE id = ?`,
    values
  );

  return {
    ...pet,
    ...updates,
    updatedAt,
  };
}

export async function deletePet(id: number): Promise<boolean> {
  const result = await dbRun("DELETE FROM animals WHERE id = ?", [id]);
  return result.changes > 0;
}
