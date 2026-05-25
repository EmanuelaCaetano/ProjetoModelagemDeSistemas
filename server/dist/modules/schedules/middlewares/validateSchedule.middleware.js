"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchedulePayload = validateSchedulePayload;
function validateSchedulePayload(req, res, next) {
    const { clientId, petId, veterinarianId, date } = req.body;
    if (!clientId || !petId || !veterinarianId || !date) {
        return res.status(400).json({ error: "clientId, petId, veterinarianId e date são obrigatórios." });
    }
    if (isNaN(Date.parse(date))) {
        return res.status(400).json({ error: "A data informada é inválida." });
    }
    next();
}
//# sourceMappingURL=validateSchedule.middleware.js.map