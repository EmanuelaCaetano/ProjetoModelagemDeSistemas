import { Response } from "express";
import { AuthRequest, authenticateJWT } from "../../../middlewares/auth";
export declare function createScheduleController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listSchedulesController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listMySchedulesController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function listSchedulesByDateController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getScheduleController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateScheduleController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function cancelScheduleController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare const scheduleMiddlewares: {
    authenticateJWT: typeof authenticateJWT;
    authorizeSecretaryOrAdmin: (req: AuthRequest, res: Response, next: import("express").NextFunction) => Response<any, Record<string, any>> | undefined;
};
//# sourceMappingURL=schedule.controller.d.ts.map