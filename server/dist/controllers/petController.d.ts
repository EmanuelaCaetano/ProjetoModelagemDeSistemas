import { Request, Response } from "express";
export declare function createPet(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listMyPets(req: Request, res: Response): Promise<void>;
export declare function getPetById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updatePet(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deletePet(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=petController.d.ts.map