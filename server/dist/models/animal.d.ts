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
export declare function toPublic(animal: Animal): AnimalPublic;
export declare function findAnimalsByCliente(clienteId: number): Promise<Animal[]>;
export declare function findAllAnimals(): Promise<Animal[]>;
export declare function createAnimal(animal: AnimalBase): Promise<Animal>;
//# sourceMappingURL=animal.d.ts.map