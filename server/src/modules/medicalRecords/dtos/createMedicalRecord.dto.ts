export interface CreateMedicalRecordDto {
  scheduleId?: string;
  animalId: number;
  diagnostico: string;
  observacoes?: string;
  medicamentos?: string;
}
