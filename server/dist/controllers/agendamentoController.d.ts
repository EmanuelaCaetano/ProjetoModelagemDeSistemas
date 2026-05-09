import { Request, Response } from 'express';
export declare const getAgendamentos: (req: Request, res: Response) => Promise<void>;
export declare const getAgendamentoById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createAgendamento: (req: Request, res: Response) => Promise<void>;
export declare const updateAgendamento: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAgendamento: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=agendamentoController.d.ts.map