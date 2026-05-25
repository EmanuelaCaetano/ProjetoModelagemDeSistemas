import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
export declare function authorizeRoles(...roles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authorize.d.ts.map