import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSchedules } from '../../../contexts/ScheduleContext';
import SecretaryCalendarScheduling from '../../../components/SecretaryCalendarScheduling';

const SecretarySchedulePage = () => {
  const { user } = useAuth();
  const { allSchedules, loading, error, syncSchedules } = useSchedules();
  const [activeTab, setActiveTab] = useState('agenda');

  useEffect(() => {
    syncSchedules();
  }, [syncSchedules]);

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
      </header>

      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'agenda' ? 'active' : ''}`}
          onClick={() => setActiveTab('agenda')}
        >
          📅 Agendar Consulta
        </button>
        <button
          className={`tab-button ${activeTab === 'gerenciar' ? 'active' : ''}`}
          onClick={() => setActiveTab('gerenciar')}
        >
          📋 Gerenciar Consultas ({allSchedules.length})
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === 'agenda' && <SecretaryCalendarScheduling />}

      {activeTab === 'gerenciar' && (
        <div>
          <div className="schedule-table-wrapper">
            {loading ? (
              <div>Carregando consultas...</div>
            ) : allSchedules.length === 0 ? (
              <div>Não há consultas agendadas.</div>
            ) : (
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
                  {allSchedules.map((item) => (
                    <tr key={item.id}>
                      <td>{item.client?.nome || '-'}</td>
                      <td>{item.pet?.nome || '-'}</td>
                      <td>{item.veterinarian?.nome || '-'}</td>
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
        </div>
      )}
    </div>
  );
};

export default SecretarySchedulePage;
