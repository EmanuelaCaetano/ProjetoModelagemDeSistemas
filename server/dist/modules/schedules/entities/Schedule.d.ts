export type ScheduleStatus = "scheduled" | "cancelled" | "completed";
export interface ScheduleBase {
    clientId: number;
    petId: number;
    veterinarianId: number;
    date: string;
    status?: ScheduleStatus;
    notes?: string;
}
export interface Schedule extends ScheduleBase {
    id: string;
    createdAt: string;
    updatedAt: string;
}
export interface ScheduleWithRelations extends Schedule {
    client?: {
        id: number;
        nome: string;
        email: string;
    };
    pet?: {
        id: number;
        nome: string;
        especie: string;
        raca?: string;
    };
    veterinarian?: {
        id: number;
        nome: string;
        especialidade?: string;
    };
}
//# sourceMappingURL=Schedule.d.ts.map