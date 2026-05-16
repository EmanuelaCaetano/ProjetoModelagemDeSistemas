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
export declare function toPublic(pet: Pet): PetPublic;
export declare function findPetById(id: number): Promise<Pet | undefined>;
export declare function findPetsByClientId(clienteId: number): Promise<Pet[]>;
export declare function createPet(pet: PetBase): Promise<Pet>;
export declare function updatePet(id: number, updates: Partial<PetBase>): Promise<Pet | undefined>;
export declare function deletePet(id: number): Promise<boolean>;
//# sourceMappingURL=pet.d.ts.map