export type AppointmentStatus = "agendada" | "confirmada" | "cancelada" | "concluida";
export interface AppointmentBase {
    animalId: number;
    clienteId: number;
    medicoId: number;
    dataHora: string;
    status?: AppointmentStatus;
    observacoes?: string;
}
export interface Appointment extends AppointmentBase {
    id: number;
    createdAt: string;
    updatedAt: string;
}
export interface AppointmentPublic {
    id: number;
    animalId: number;
    clienteId: number;
    medicoId: number;
    dataHora: string;
    status: AppointmentStatus;
    observacoes?: string;
    createdAt: string;
    updatedAt: string;
    animal?: {
        id: number;
        nome: string;
        especie: string;
        raca?: string;
    };
    cliente?: {
        id: number;
        nome: string;
        email: string;
    };
    medico?: {
        id: number;
        nome: string;
        especialidade?: string;
    };
}
export declare function toPublic(appointment: Appointment): AppointmentPublic;
export declare function createAppointment(appointmentData: AppointmentBase): Promise<Appointment>;
export declare function findAppointmentById(id: number): Promise<Appointment | null>;
export declare function findAppointmentsByCliente(clienteId: number): Promise<Appointment[]>;
export declare function findAppointmentsByMedico(medicoId: number): Promise<Appointment[]>;
export declare function findAllAppointments(): Promise<Appointment[]>;
export declare function updateAppointment(id: number, appointmentData: Partial<AppointmentBase>): Promise<Appointment | null>;
export declare function deleteAppointment(id: number): Promise<boolean>;
export declare function getAppointmentsWithDetails(): Promise<AppointmentPublic[]>;
//# sourceMappingURL=appointment.d.ts.map