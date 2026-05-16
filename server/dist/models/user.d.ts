export type UserRole = "cliente" | "medico" | "administrador" | "secretario";
export interface UserBase {
    nome: string;
    email: string;
    senha: string;
    role: UserRole;
    telefone?: string;
    endereco?: string;
    crmv?: string;
    especialidade?: string;
    nivelAcesso?: string;
}
export interface User extends UserBase {
    id: number;
    createdAt: string;
}
export interface UserPublic {
    id: number;
    nome: string;
    email: string;
    tipoUsuario: UserRole;
    telefone?: string;
    endereco?: string;
    crmv?: string;
    especialidade?: string;
    nivelAcesso?: string;
    createdAt: string;
}
export declare function toPublic(user: User): UserPublic;
export declare function findUserByEmail(email: string): Promise<User | undefined>;
export declare function findAllUsers(): Promise<User[]>;
export declare function updateUser(id: number, userData: Partial<UserBase>): Promise<User | undefined>;
export declare function deleteUser(id: number): Promise<boolean>;
export declare function createUser(user: UserBase): Promise<User>;
//# sourceMappingURL=user.d.ts.map