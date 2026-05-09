"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgendamento = exports.updateAgendamento = exports.createAgendamento = exports.getAgendamentoById = exports.getAgendamentos = void 0;
const express_1 = require("express");
const agendamento_1 = require("../models/agendamento");
const getAgendamentos = async (req, res) => {
    try {
        const { data, medicoId } = req.query;
        let agendamentos = agendamento_1.mockAgendamentos;
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
    }
    catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getAgendamentos = getAgendamentos;
const getAgendamentoById = async (req, res) => {
    try {
        const { id } = req.params;
        const agendamento = agendamento_1.mockAgendamentos.find(ag => ag.id === parseInt(id));
        if (!agendamento) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        res.json(agendamento);
    }
    catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.getAgendamentoById = getAgendamentoById;
const createAgendamento = async (req, res) => {
    try {
        const { clienteNome, clienteId, medicoId, animalNome, data, horario, descricao } = req.body;
        const newAgendamento = {
            id: agendamento_1.mockAgendamentos.length + 1,
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
        agendamento_1.mockAgendamentos.push(newAgendamento);
        res.status(201).json(newAgendamento);
    }
    catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.createAgendamento = createAgendamento;
const updateAgendamento = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const agendamentoIndex = agendamento_1.mockAgendamentos.findIndex(ag => ag.id === parseInt(id));
        if (agendamentoIndex === -1) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        agendamento_1.mockAgendamentos[agendamentoIndex] = { ...agendamento_1.mockAgendamentos[agendamentoIndex], ...updates };
        res.json(agendamento_1.mockAgendamentos[agendamentoIndex]);
    }
    catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.updateAgendamento = updateAgendamento;
const deleteAgendamento = async (req, res) => {
    try {
        const { id } = req.params;
        const agendamentoIndex = agendamento_1.mockAgendamentos.findIndex(ag => ag.id === parseInt(id));
        if (agendamentoIndex === -1) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        agendamento_1.mockAgendamentos.splice(agendamentoIndex, 1);
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.deleteAgendamento = deleteAgendamento;
//# sourceMappingURL=agendamentoController.js.map