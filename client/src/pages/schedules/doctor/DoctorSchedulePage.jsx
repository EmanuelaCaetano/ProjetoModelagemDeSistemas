import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchMySchedules } from '../../../services/scheduleService';
import MedicalRecordForm from '../../../components/MedicalRecordForm';
import PrescriptionForm from '../../../components/PrescriptionForm';
import EditableProfile from '../../../components/EditableProfile';
import './DoctorSchedulePage.css';

const DoctorSchedulePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('agenda');
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
      setSchedules(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar sua agenda.');
    }
    setLoading(false);
  };

  if (!user || user.tipoUsuario !== 'medico') {
    return <div className="unauthorized-message">Você não tem permissão para acessar esta página.</div>;
  }

  return (
    <div className="schedule-page doctor-schedule-page">
      <header className="schedule-page-header">
        <div>
          <h1>📋 Painel do Médico</h1>
          <p>Gerencie sua agenda, registre prontuários e emita receituários de forma rápida.</p>
        </div>
        <button className="logout-button" onClick={() => logout()}>
          🚪 Sair
        </button>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="doctor-profile-summary">
        <div className="doctor-card doctor-info-card">
          <span>Médico Veterinário</span>
          <h2>Dr. {user.nome}</h2>
          <p>CRMV: <strong>{user.crmv || 'Não informado'}</strong></p>
          <p>Especialidade: <strong>{user.especialidade || 'Geral'}</strong></p>
        </div>

        <div className="doctor-card doctor-stat-card">
          <div>
            <h3>{loading ? '...' : schedules.length}</h3>
            <p>Consultas atribuídas</p>
          </div>
          <div>
            <h3>{schedules.filter((item) => item.status === 'confirmada').length}</h3>
            <p>Consultas confirmadas</p>
          </div>
        </div>
      </div>

      <div className="doctor-tabs">
        <button
          className={activeTab === 'agenda' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('agenda')}
        >
          Agenda
        </button>
        <button
          className={activeTab === 'prontuarios' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('prontuarios')}
        >
          Prontuários
        </button>
        <button
          className={activeTab === 'receituarios' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('receituarios')}
        >
          Receituários
        </button>
        <button
          className={activeTab === 'perfil' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('perfil')}
        >
          Perfil
        </button>
      </div>

      <div className="doctor-tab-panel">
        {activeTab === 'agenda' && (
          <section className="doctor-schedule-panel">
            <h2>Consultas agendadas</h2>
            {loading ? (
              <div>Carregando sua agenda...</div>
            ) : schedules.length === 0 ? (
              <div>Você ainda não possui consultas agendadas.</div>
            ) : (
              <div className="schedule-table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Pet</th>
                      <th>Cliente</th>
                      <th>Data / Horário</th>
                      <th>Status</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((item) => (
                      <tr key={item.id}>
                        <td>{item.pet?.nome || '-'}</td>
                        <td>{item.client?.nome || '-'}</td>
                        <td>{new Date(item.date).toLocaleString('pt-BR')}</td>
                        <td>{item.status}</td>
                        <td>{item.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'prontuarios' && (
          <section className="doctor-action-panel">
            <h2>Registrar Prontuário</h2>
            <MedicalRecordForm schedules={schedules} onSuccess={loadSchedules} />
          </section>
        )}

        {activeTab === 'receituarios' && (
          <section className="doctor-action-panel">
            <h2>Gerar Receituário</h2>
            <PrescriptionForm schedules={schedules} />
          </section>
        )}

        {activeTab === 'perfil' && (
          <section className="doctor-action-panel">
            <h2>Meu Perfil</h2>
            <EditableProfile />
          </section>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
