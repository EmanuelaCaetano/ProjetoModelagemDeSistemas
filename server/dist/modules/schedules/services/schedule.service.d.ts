import { CreateScheduleDto } from "../dtos/createSchedule.dto";
import { UpdateScheduleDto } from "../dtos/updateSchedule.dto";
import { Schedule, ScheduleWithRelations } from "../entities/Schedule";
export declare function findScheduleById(id: string): Promise<Schedule | null>;
export declare function findAllSchedules(): Promise<ScheduleWithRelations[]>;
export declare function findSchedulesByClient(clientId: number): Promise<ScheduleWithRelations[]>;
export declare function findSchedulesByDate(date: string): Promise<ScheduleWithRelations[]>;
export declare function hasVeterinarianConflict(veterinarianId: number, date: string, scheduleId?: string): Promise<boolean>;
export declare function createSchedule(data: CreateScheduleDto): Promise<Schedule>;
export declare function updateSchedule(id: string, data: UpdateScheduleDto): Promise<Schedule | null>;
export declare function cancelSchedule(id: string): Promise<Schedule | null>;
//# sourceMappingURL=schedule.service.d.ts.map