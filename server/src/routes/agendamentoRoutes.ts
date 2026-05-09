import { Router } from 'express';
import {
  getAgendamentos,
  getAgendamentoById,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento
} from '../controllers/agendamentoController';

const router = Router();

// GET /agendamentos - Buscar agendamentos (com filtros opcionais: data, medicoId)
router.get('/', getAgendamentos);

// GET /agendamentos/:id - Buscar agendamento por ID
router.get('/:id', getAgendamentoById);

// POST /agendamentos - Criar novo agendamento
router.post('/', createAgendamento);

// PUT /agendamentos/:id - Atualizar agendamento
router.put('/:id', updateAgendamento);

// DELETE /agendamentos/:id - Deletar agendamento
router.delete('/:id', deleteAgendamento);

export default router;