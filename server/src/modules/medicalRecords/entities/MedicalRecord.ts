export interface MedicalRecordBase {
  scheduleId?: string;
  animalId: number;
  doctorId: number;
  diagnostico: string;
  observacoes?: string;
  medicamentos?: string;
}

export interface MedicalRecord extends MedicalRecordBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordWithRelations extends MedicalRecord {
  animal?: {
    id: number;
    nome: string;
    especie: string;
    raca?: string;
  };
  doctor?: {
    id: number;
    nome: string;
    crmv?: string;
    especialidade?: string;
  };
  owner?: {
    id: number;
    nome: string;
    email: string;
  };
}
