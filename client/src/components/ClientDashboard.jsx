import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PetList from './PetList';
import CalendarScheduling from './CalendarScheduling';
import EditableProfile from './EditableProfile';
import { fetchMySchedules } from '../services/scheduleService';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  useEffect(() => {
    const loadSchedules = async () => {
      setLoadingSchedules(true);
      setScheduleError('');

      try {
        const data = await fetchMySchedules();
        setSchedules(Array.isArray(data) ? data : []);
      } catch (err) {
        setScheduleError('Não foi possível carregar suas consultas.');
      } finally {
        setLoadingSchedules(false);
      }
    };

    loadSchedules();
  }, []);

  return (
    <div className="client-dashboard">
      {/* Header com perfil e logout */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏥 NewPet Clínica Veterinária</h1>
          <div className="user-info">
            <span className="welcome">Bem-vindo, <strong>{user.nome}</strong>!</span>
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              🚪 Sair
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Visão Geral
        </button>
        <button
          className={`tab-button ${activeTab === 'calendario' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendario')}
        >
          📅 Calendário
        </button>
        <button
          className={`tab-button ${activeTab === 'pets' ? 'active' : ''}`}
          onClick={() => setActiveTab('pets')}
        >
          🐾 Meus Pets
        </button>
        <button
          className={`tab-button ${activeTab === 'consultas' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultas')}
        >
          📋 Minhas Consultas
        </button>
        <button
          className={`tab-button ${activeTab === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveTab('perfil')}
        >
          👤 Perfil
        </button>
      </div>

      {/* Conteúdo das abas */}
      <div className="tabs-content">
        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <div className="tab-pane overview-tab">
            <div className="welcome-card">
              <h2>🎉 Bem-vindo à NewPet!</h2>
              <p>
                Aqui você pode gerenciar seus pets, agendar consultas com nossos veterinários
                e acompanhar o histórico de atendimentos.
              </p>
            </div>

            <div className="quick-actions-grid">
              <div className="action-card" onClick={() => setActiveTab('pets')}>
                <div className="action-icon">🐾</div>
                <h3>Meus Pets</h3>
                <p>Visualizar e gerenciar seus animais de estimação</p>
              </div>

              <div className="action-card" onClick={() => setActiveTab('calendario')}>
                <div className="action-icon">📅</div>
                <h3>Agendar Consulta</h3>
                <p>Marcar uma consulta com nossos veterinários</p>
              </div>

              <div className="action-card" onClick={() => setActiveTab('calendario')}>
                <div className="action-icon">📋</div>
                <h3>Minhas Consultas</h3>
                <p>Visualizar consultas agendadas e histórico</p>
              </div>

              <div className="action-card" onClick={() => setActiveTab('perfil')}>
                <div className="action-icon">👤</div>
                <h3>Meu Perfil</h3>
                <p>Atualizar dados pessoais</p>
              </div>
            </div>

            <div className="info-section">
              <h3>📱 Contato</h3>
              <p>Telefone: (11) 3000-0000</p>
              <p>Email: contato@newpet.com</p>
              <p>Endereço: Av. Paulista, 1000</p>
            </div>
          </div>
        )}

        {/* Calendário */}
        {activeTab === 'calendario' && (
          <div className="tab-pane">
            <CalendarScheduling />
          </div>
        )}

        {/* Meus Pets */}
        {activeTab === 'pets' && (
          <div className="tab-pane">
            <PetList />
          </div>
        )}

        {/* Minhas Consultas */}
        {activeTab === 'consultas' && (
          <div className="tab-pane consultas-tab">
            <h2>📅 Minhas Consultas</h2>
            {scheduleError && <div className="alert alert-error">{scheduleError}</div>}
            {loadingSchedules ? (
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
                        <td>{item.pet?.nome || '-'}</td>
                        <td>{item.veterinarian?.nome || '-'}</td>
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
        )}

        {/* Perfil */}
        {activeTab === 'perfil' && (
          <div className="tab-pane perfil-tab">
            <EditableProfile />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>&copy; 2026 NewPet Clínica Veterinária. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default ClientDashboard;
