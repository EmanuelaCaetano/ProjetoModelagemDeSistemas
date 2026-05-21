import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  cancelSchedule,
  createSchedule,
  fetchAllSchedules,
  updateSchedule,
} from '../../../services/scheduleService';
import axios from '../../../services/api';
import ScheduleForm from './ScheduleForm';

const SecretarySchedulePage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheduleResponse, clientResponse, petResponse] = await Promise.all([
        fetchAllSchedules(),
        axios.get('/auth/users'),
        axios.get('/animals'),
      ]);

      setSchedules(scheduleResponse);
      setClients(clientResponse.data.filter((u) => u.tipoUsuario === 'cliente'));
      setPets(petResponse.data);
      setVeterinarians(clientResponse.data.filter((u) => u.tipoUsuario === 'medico'));
    } catch (err) {
      setError('Não foi possível carregar os dados da agenda.');
    }
    setLoading(false);
  };

  const normalizePayload = (payload) => ({
    clientId: Number(payload.clientId),
    petId: Number(payload.petId),
    veterinarianId: Number(payload.veterinarianId),
    date: payload.date,
    notes: payload.notes,
  });

  const handleCreate = async (payload) => {
    setError('');
    try {
      await createSchedule(normalizePayload(payload));
      setShowForm(false);
      setEditingSchedule(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro ao criar consulta.');
    }
  };

  const handleUpdate = async (payload) => {
    setError('');
    try {
      await updateSchedule(editingSchedule.id, normalizePayload(payload));
      setShowForm(false);
      setEditingSchedule(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro ao atualizar consulta.');
    }
  };

  const handleCancel = async (scheduleId) => {
    try {
      await cancelSchedule(scheduleId);
      await loadData();
    } catch (err) {
      setError('Erro ao cancelar a consulta.');
    }
  };

  if (!user || user.tipoUsuario !== 'secretario') {
    return <div>Você não tem permissão para acessar esta página.</div>;
  }

  return (
    <div className="schedule-page">
      <header className="schedule-page-header">
        <div>
          <h1>Agenda da Secretaria</h1>
          <p>Gerencie consultas, evite conflitos de horário e mantenha as agendas atualizadas.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nova consulta
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div>Carregando agenda...</div>
      ) : (
        <div className="schedule-table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pet</th>
                <th>Médico</th>
                <th>Data / Horário</th>
                <th>Status</th>
                <th>Observações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((item) => (
                <tr key={item.id}>
                  <td>{item.client?.nome}</td>
                  <td>{item.pet?.nome}</td>
                  <td>{item.veterinarian?.nome}</td>
                  <td>{new Date(item.date).toLocaleString('pt-BR')}</td>
                  <td>{item.status}</td>
                  <td>{item.notes || '—'}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setEditingSchedule(item);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleCancel(item.id)}
                      disabled={item.status === 'cancelled'}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ScheduleForm
          clients={clients}
          pets={pets}
          veterinarians={veterinarians}
          schedule={editingSchedule}
          onSubmit={editingSchedule ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingSchedule(null);
          }}
        />
      )}
    </div>
  );
};

export default SecretarySchedulePage;
