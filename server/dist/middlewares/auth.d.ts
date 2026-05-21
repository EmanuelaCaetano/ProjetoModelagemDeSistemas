import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
    userEmail?: string;
}
export declare function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.d.ts.map