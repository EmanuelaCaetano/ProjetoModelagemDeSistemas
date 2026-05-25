"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const jwt_1 = require("../utils/jwt");
const user_1 = require("../models/user");
async function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : undefined;
        if (!bearerToken) {
            const userId = req.headers["x-user-id"];
            if (!userId) {
                return res.status(401).json({ error: "Token não fornecido." });
            }
            req.userId = parseInt(userId, 10);
            return next();
        }
        const payload = (0, jwt_1.verifyToken)(bearerToken);
        const user = await (0, user_1.findUserByEmail)(payload.email);
        if (!user || user.id !== payload.sub) {
            return res.status(401).json({ error: "Token inválido." });
        }
        req.userId = payload.sub;
        req.userEmail = payload.email;
        req.userRole = payload.role;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: "Falha na autenticação." });
    }
}
//# sourceMappingURL=auth.js.map