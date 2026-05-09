export interface Agendamento {
  id: number;
  clienteNome: string;
  clienteId: number;
  medicoId: number;
  animalNome?: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  descricao: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  createdAt: string;
}

// Dados mockados para desenvolvimento
export const mockAgendamentos: Agendamento[] = [
  {
    id: 1,
    clienteNome: "João Silva",
    clienteId: 1,
    medicoId: 1,
    animalNome: "Rex",
    data: "2024-01-15",
    horario: "10:00",
    descricao: "Consulta de rotina",
    status: "agendado",
    createdAt: "2024-01-10T09:00:00Z"
  },
  {
    id: 2,
    clienteNome: "Maria Santos",
    clienteId: 2,
    medicoId: 1,
    animalNome: "Luna",
    data: "2024-01-15",
    horario: "14:30",
    descricao: "Vacinação",
    status: "agendado",
    createdAt: "2024-01-12T14:00:00Z"
  },
  {
    id: 3,
    clienteNome: "Pedro Oliveira",
    clienteId: 3,
    medicoId: 2,
    animalNome: "Max",
    data: "2024-01-16",
    horario: "09:00",
    descricao: "Exame dermatológico",
    status: "agendado",
    createdAt: "2024-01-13T11:00:00Z"
  }
];