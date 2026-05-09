"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agendamentoController_1 = require("../controllers/agendamentoController");
const router = (0, express_1.Router)();
// GET /agendamentos - Buscar agendamentos (com filtros opcionais: data, medicoId)
router.get('/', agendamentoController_1.getAgendamentos);
// GET /agendamentos/:id - Buscar agendamento por ID
router.get('/:id', agendamentoController_1.getAgendamentoById);
// POST /agendamentos - Criar novo agendamento
router.post('/', agendamentoController_1.createAgendamento);
// PUT /agendamentos/:id - Atualizar agendamento
router.put('/:id', agendamentoController_1.updateAgendamento);
// DELETE /agendamentos/:id - Deletar agendamento
router.delete('/:id', agendamentoController_1.deleteAgendamento);
exports.default = router;
//# sourceMappingURL=agendamentoRoutes.js.map