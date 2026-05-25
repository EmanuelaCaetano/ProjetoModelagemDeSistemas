import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMySchedules } from '../../../services/scheduleService';

const ClientSchedulePage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await fetchMySchedules();
      setSchedules(data);
    } catch (err) {
      setError('Não foi possível carregar suas consultas.');
    }
    setLoading(false);
  };

  if (!user || user.tipoUsuario !== 'cliente') {
    return <div>Você não tem permissão para acessar esta página.</div>;
  }

  return (
    <div className="schedule-page">
      <header className="schedule-page-header">
        <div>
          <h1>Minhas Consultas</h1>
          <p>Visualize suas consultas agendadas e o status de cada uma.</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div>Carregando suas consultas...</div>
      ) : schedules.length === 0 ? (
        <div>Você ainda não tem consultas agendadas.</div>
      ) : (
        <div className="schedule-table-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Médico</th>
                <th>Data / Horário</th>
                <th>Status</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((item) => (
                <tr key={item.id}>
                  <td>{item.pet?.nome}</td>
                  <td>{item.veterinarian?.nome}</td>
                  <td>{new Date(item.date).toLocaleString('pt-BR')}</td>
                  <td>{item.status}</td>
                  <td>{item.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientSchedulePage;
