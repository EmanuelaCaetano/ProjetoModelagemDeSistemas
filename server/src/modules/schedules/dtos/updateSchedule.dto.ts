export interface UpdateScheduleDto {
  clientId?: number;
  petId?: number;
  veterinarianId?: number;
  date?: string;
  status?: "scheduled" | "cancelled" | "completed";
  notes?: string;
}
