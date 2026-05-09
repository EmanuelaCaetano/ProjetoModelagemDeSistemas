export interface Agendamento {
    id: number;
    clienteNome: string;
    clienteId: number;
    medicoId: number;
    animalNome?: string;
    data: string;
    horario: string;
    descricao: string;
    status: 'agendado' | 'concluido' | 'cancelado';
    createdAt: string;
}
export declare const mockAgendamentos: Agendamento[];
//# sourceMappingURL=agendamento.d.ts.map