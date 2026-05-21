"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = authorizeRoles;
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(403).json({ error: "Acesso negado." });
        }
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ error: "Permissão insuficiente." });
        }
        next();
    };
}
//# sourceMappingURL=authorize.js.map