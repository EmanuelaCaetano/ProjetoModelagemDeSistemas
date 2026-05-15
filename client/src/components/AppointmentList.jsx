import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/api';
import AppointmentForm from './AppointmentForm';
import './AppointmentList.css';

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    medicoId: '',
    clienteId: '',
    dataInicio: '',
    dataFim: ''
  });
  const [medicos, setMedicos] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchUsers();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/appointments');
      let filteredAppointments = response.data;

      // Filtrar baseado no tipo de usuário
      if (user?.tipoUsuario === 'cliente') {
        filteredAppointments = filteredAppointments.filter(app => app.clienteId === user.id);
      } else if (user?.tipoUsuario === 'medico') {
        filteredAppointments = filteredAppointments.filter(app => app.medicoId === user.id);
      }
      // Secretaria e admin veem todas

      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/auth/users');
      setMedicos(response.data.filter(u => u.tipoUsuario === 'medico'));
      setClientes(response.data.filter(u => u.tipoUsuario === 'cliente'));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter.status && appointment.status !== filter.status) return false;
    if (filter.medicoId && appointment.medicoId != filter.medicoId) return false;
    if (filter.clienteId && appointment.clienteId != filter.clienteId) return false;
    if (filter.dataInicio && appointment.dataHora < filter.dataInicio) return false;
    if (filter.dataFim && appointment.dataHora > filter.dataFim) return false;
    return true;
  });

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put(`/appointments/${appointmentId}`, { status: newStatus });
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta consulta?')) {
      try {
        await axios.put(`/appointments/${appointmentId}`, { status: 'cancelada' });
        fetchAppointments();
      } catch (error) {
        console.error('Erro ao cancelar consulta:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendada': return '#fbbf24';
      case 'confirmada': return '#10b981';
      case 'cancelada': return '#ef4444';
      case 'concluida': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Carregando consultas...</div>;
  }

  return (
    <div className="appointment-list">
      <div className="list-header">
        <h2>📋 Gerenciamento de Consultas</h2>
        {(user?.tipoUsuario === 'secretario' || user?.tipoUsuario === 'administrador') && (
          <button onClick={() => setShowForm(true)} className="add-button">
            + Nova Consulta
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select name="status" value={filter.status} onChange={handleFilterChange}>
            <option value="">Todos</option>
            <option value="agendada">Agendada</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>

        {(user?.tipoUsuario === 'secretario' || user?.tipoUsuario === 'administrador') && (
          <>
            <div className="filter-group">
              <label>Médico:</label>
              <select name="medicoId" value={filter.medicoId} onChange={handleFilterChange}>
                <option value="">Todos</option>
                {medicos.map(medico => (
                  <option key={medico.id} value={medico.id}>
                    Dr. {medico.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Cliente:</label>
              <select name="clienteId" value={filter.clienteId} onChange={handleFilterChange}>
                <option value="">Todos</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="filter-group">
          <label>Data Início:</label>
          <input
            type="datetime-local"
            name="dataInicio"
            value={filter.dataInicio}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Data Fim:</label>
          <input
            type="datetime-local"
            name="dataFim"
            value={filter.dataFim}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Lista de Consultas */}
      <div className="appointments-grid">
        {filteredAppointments.length === 0 ? (
          <p>Nenhuma consulta encontrada.</p>
        ) : (
          filteredAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>{appointment.animal?.nome} ({appointment.animal?.especie})</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="appointment-details">
                <p><strong>Data/Hora:</strong> {formatDateTime(appointment.dataHora)}</p>
                <p><strong>Cliente:</strong> {appointment.cliente?.nome}</p>
                <p><strong>Médico:</strong> Dr. {appointment.medico?.nome}</p>
                {appointment.observacoes && (
                  <p><strong>Observações:</strong> {appointment.observacoes}</p>
                )}
              </div>

              {(user?.tipoUsuario === 'secretario' || user?.tipoUsuario === 'administrador') && (
                <div className="appointment-actions">
                  {appointment.status === 'agendada' && (
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'confirmada')}
                      className="confirm-button"
                    >
                      Confirmar
                    </button>
                  )}
                  {appointment.status !== 'cancelada' && appointment.status !== 'concluida' && (
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="cancel-button"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showForm && (
        <AppointmentForm
          onClose={() => setShowForm(false)}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  );
};

export default AppointmentList;