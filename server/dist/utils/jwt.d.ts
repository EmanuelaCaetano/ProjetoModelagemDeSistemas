import { UserRole } from "../models/user";
export interface JwtPayload {
    sub: number;
    email: string;
    role: UserRole;
}
export declare function signToken(payload: JwtPayload): string;
export declare function verifyToken(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map