import type { Request, Response } from 'express';
import { mockAgendamentos } from '../models/agendamento';
import type { Agendamento } from '../models/agendamento';

export const getAgendamentos = async (req: Request, res: Response) => {
  try {
    const data = Array.isArray(req.query.data) ? req.query.data[0] : req.query.data;
    const medicoId = Array.isArray(req.query.medicoId) ? req.query.medicoId[0] : req.query.medicoId;

    let agendamentos = mockAgendamentos;

    // Filtrar por data se fornecida
    if (data) {
      agendamentos = agendamentos.filter(ag => ag.data === data);
    }

    // Filtrar por médico se fornecido
    if (medicoId) {
      agendamentos = agendamentos.filter(ag => ag.medicoId === parseInt(medicoId));
    }

    // Formatar para o formato esperado pelo frontend
    const formattedAgendamentos = agendamentos.map(ag => ({
      id: ag.id,
      horario: `${ag.data} ${ag.horario}`,
      clienteNome: ag.clienteNome,
      descricao: ag.descricao,
      status: ag.status
    }));

    res.json(formattedAgendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getAgendamentoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agendamento = mockAgendamentos.find(ag => ag.id === parseInt(id));

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createAgendamento = async (req: Request, res: Response) => {
  try {
    const { clienteNome, clienteId, medicoId, animalNome, data, horario, descricao } = req.body;

    const newAgendamento: Agendamento = {
      id: mockAgendamentos.length + 1,
      clienteNome,
      clienteId,
      medicoId,
      animalNome,
      data,
      horario,
      descricao,
      status: 'agendado',
      createdAt: new Date().toISOString()
    };

    mockAgendamentos.push(newAgendamento);

    res.status(201).json(newAgendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateAgendamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const agendamentoIndex = mockAgendamentos.findIndex(ag => ag.id === parseInt(id));

    if (agendamentoIndex === -1) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    mockAgendamentos[agendamentoIndex] = { ...mockAgendamentos[agendamentoIndex], ...updates };

    res.json(mockAgendamentos[agendamentoIndex]);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteAgendamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agendamentoIndex = mockAgendamentos.findIndex(ag => ag.id === parseInt(id));

    if (agendamentoIndex === -1) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    mockAgendamentos.splice(agendamentoIndex, 1);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};