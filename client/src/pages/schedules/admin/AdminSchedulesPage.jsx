import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSchedules } from '../../../contexts/ScheduleContext';

const AdminSchedulesPage = () => {
  const { user } = useAuth();
  const { allSchedules, loading, error, syncSchedules } = useSchedules();

  useEffect(() => {
    syncSchedules();
  }, [syncSchedules]);

  if (!user || user.tipoUsuario !== 'administrador') {
    return <div>Você não tem permissão para acessar esta página.</div>;
  }

  return (
    <div className="schedule-page">
      <header className="schedule-page-header">
        <div>
          <h1>Agenda Administrativa</h1>
          <p>Visualize todas as consultas da clínica em tempo real.</p>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div>Carregando agenda clínica...</div>
      ) : (
        <div className="schedule-table-wrapper">
          <div className="schedule-info">
            <strong>Total de Consultas: {allSchedules.length}</strong>
          </div>
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
              {allSchedules.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    Nenhuma consulta agendada ainda.
                  </td>
                </tr>
              ) : (
                allSchedules.map((item) => (
                  <tr key={item.id}>
                    <td>{item.client?.nome}</td>
                    <td>{item.pet?.nome}</td>
                    <td>{item.veterinarian?.nome}</td>
                    <td>{new Date(item.date).toLocaleString('pt-BR')}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status === 'scheduled' && 'Agendada'}
                        {item.status === 'confirmed' && 'Confirmada'}
                        {item.status === 'cancelled' && 'Cancelada'}
                        {item.status === 'completed' && 'Concluída'}
                      </span>
                    </td>
                    <td>{item.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSchedulesPage;
