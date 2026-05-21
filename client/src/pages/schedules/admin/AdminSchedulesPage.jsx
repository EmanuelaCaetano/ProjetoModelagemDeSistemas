import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchAllSchedules } from '../../../services/scheduleService';

const AdminSchedulesPage = () => {
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
      const data = await fetchAllSchedules();
      setSchedules(data);
    } catch (err) {
      setError('Não foi possível carregar a agenda da clínica.');
    }
    setLoading(false);
  };

  if (!user || user.tipoUsuario !== 'administrador') {
    return <div>Você não tem permissão para acessar esta página.</div>;
  }

  return (
    <div className="schedule-page">
      <header className="schedule-page-header">
        <div>
          <h1>Agenda Administrativa</h1>
          <p>Visualize todas as consultas da clínica sem editar ou cancelar.</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div>Carregando agenda clínica...</div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSchedulesPage;
