import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateUserController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteUserController(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateProfileController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function changePasswordController(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map