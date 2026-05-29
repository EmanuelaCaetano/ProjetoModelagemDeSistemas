"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchedulePayload = validateSchedulePayload;
function validateSchedulePayload(req, res, next) {
    const { clientId, petId, veterinarianId, date } = req.body;
    const authenticatedClientId = req.userId;
    const effectiveClientId = clientId || authenticatedClientId;
    const userRole = req.userRole;
    const requiresPet = userRole !== 'secretario' && userRole !== 'administrador';
    if (!effectiveClientId || (requiresPet && !petId) || !veterinarianId || !date) {
        return res.status(400).json({ error: "clientId, petId, veterinarianId e date são obrigatórios." });
    }
    if (!clientId && authenticatedClientId) {
        req.body.clientId = authenticatedClientId;
    }
    if (isNaN(Date.parse(date))) {
        return res.status(400).json({ error: "A data informada é inválida." });
    }
    next();
}
//# sourceMappingURL=validateSchedule.middleware.js.map