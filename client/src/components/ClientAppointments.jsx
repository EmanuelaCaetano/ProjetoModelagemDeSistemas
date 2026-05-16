import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/api';
import './ClientAppointments.css';

const ClientAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/appointments/cliente/${user.id}`);
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar consultas do cliente:', err);
      setError('Não foi possível carregar suas consultas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      case 'concluida':
        return 'Concluída';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendada':
        return '#fbbf24';
      case 'confirmada':
        return '#10b981';
      case 'cancelada':
        return '#ef4444';
      case 'concluida':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div className="client-appointments-loading">Carregando suas consultas...</div>;
  }

  if (error) {
    return <div className="client-appointments-error">{error}</div>;
  }

  return (
    <div className="client-appointments">
      {appointments.length === 0 ? (
        <div className="empty-appointments">
          <h3>Você ainda não possui consultas agendadas.</h3>
          <p>Quando você marcar uma consulta, ela aparecerá aqui com o médico responsável e horário.</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="client-appointment-card">
              <div className="client-appointment-header">
                <div>
                  <h3>{appointment.animal?.nome || 'Pet não informado'}</h3>
                  <p>{appointment.animal?.especie ? `${appointment.animal.especie}` : 'Espécie não informada'}</p>
                </div>
                <span
                  className="client-appointment-status"
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              <div className="client-appointment-body">
                <p>
                  <strong>Data e horário:</strong> {formatDateTime(appointment.dataHora)}
                </p>
                <p>
                  <strong>Médico responsável:</strong> Dr. {appointment.medico?.nome || 'Não informado'}
                </p>
                {appointment.medico?.especialidade && (
                  <p>
                    <strong>Especialidade:</strong> {appointment.medico.especialidade}
                  </p>
                )}
                {appointment.observacoes ? (
                  <p className="appointment-notes">
                    <strong>Descrição:</strong> {appointment.observacoes}
                  </p>
                ) : (
                  <p className="appointment-notes appointment-no-notes">
                    Nenhuma descrição foi adicionada a esta consulta.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientAppointments;
