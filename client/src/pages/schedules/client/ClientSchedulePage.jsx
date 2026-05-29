import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSchedules } from '../../../contexts/ScheduleContext';
import ClientCalendarScheduling from '../../../components/ClientCalendarScheduling';

const ClientSchedulePage = () => {
  const { user } = useAuth();
  const { mySchedules, loading, error, syncSchedules } = useSchedules();
  const [activeTab, setActiveTab] = useState('agendar');

  useEffect(() => {
    syncSchedules();
  }, [syncSchedules]);

  if (!user || user.tipoUsuario !== 'cliente') {
    return <div>Você não tem permissão para acessar esta página.</div>;
  }

  return (
    <div className="schedule-page">
      <header className="schedule-page-header">
        <div>
          <h1>Minhas Consultas</h1>
          <p>Visualize e agende suas consultas com os veterinários da clínica.</p>
        </div>
      </header>

      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'agendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('agendar')}
        >
          📅 Agendar Consulta
        </button>
        <button
          className={`tab-button ${activeTab === 'visualizar' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualizar')}
        >
          📋 Minhas Consultas ({mySchedules.length})
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === 'agendar' && <ClientCalendarScheduling />}

      {activeTab === 'visualizar' && (
        <div className="schedule-table-wrapper">
          {loading ? (
            <div>Carregando suas consultas...</div>
          ) : mySchedules.length === 0 ? (
            <div>Você ainda não tem consultas agendadas. Agende uma consultando a aba acima.</div>
          ) : (
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
                {mySchedules.map((item) => (
                  <tr key={item.id}>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSchedulePage;
