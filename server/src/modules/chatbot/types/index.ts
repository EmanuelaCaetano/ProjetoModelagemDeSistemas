export type UserRole = "cliente" | "medico" | "administrador" | "secretario";

export interface ChatMessageRequest {
  message: string;
  conversationId?: string;
}

export interface ChatMessageResponse {
  id: string;
  message: string;
  role: "user" | "assistant";
  timestamp: Date;
  toolsUsed?: string[];
}

export interface ConversationContext {
  userId: number;
  userRole: UserRole;
  recentMessages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface ScheduleInfo {
  id: string;
  clientId: number;
  petId: number;
  veterinarianId: number;
  date: Date;
  status: string;
  petName: string;
  veterinarianName: string;
  veterinarianSpecialty: string;
}

export interface VeterinarianInfo {
  id: number;
  nome: string;
  especialidade: string;
  crmv: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableSchedule {
  date: Date;
  timeSlots: TimeSlot[];
  veterinarian: VeterinarianInfo;
}

export interface ChatToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  };
}
