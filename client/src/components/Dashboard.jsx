import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalForm from './AnimalForm';
import UserManagement from './UserManagement';
import AppointmentForm from './AppointmentForm';
import AppointmentList from './AppointmentList';
import { fetchAllSchedules } from '../services/scheduleService';
import axios from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showAppointmentList, setShowAppointmentList] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportError, setReportError] = useState('');
  const [animais, setAnimais] = useState([]);
  const [loadingAnimais, setLoadingAnimais] = useState(false);

  useEffect(() => {
    if (user.tipoUsuario === 'cliente') {
      fetchAnimais();
    }
  }, [user]);

  const fetchAnimais = async () => {
    setLoadingAnimais(true);
    try {
      const response = await axios.get(`/animals/${user.id}`);
      setAnimais(response.data);
    } catch (error) {
      console.error('Erro ao buscar animais:', error);
    }
    setLoadingAnimais(false);
  };

  const getDashboardTitle = () => {
    switch (user.tipoUsuario) {
      case 'administrador':
        return 'Painel Administrativo';
      case 'secretario':
        return 'Painel da Secretaria';
      case 'medico':
        return 'Painel Médico';
      case 'cliente':
        return 'Minha Conta';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardContent = () => {
    switch (user.tipoUsuario) {
      case 'administrador':
        return (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h2>👋 Bem-vindo, {user.nome}!</h2>
              <p>Você tem acesso total ao sistema da clínica veterinária.</p>
            </div>

            <div className="features-grid">
              <div className="feature-card" onClick={() => setShowUserManagement(true)} style={{ cursor: 'pointer' }}>
                <h3>👥 Gerenciar Usuários</h3>
                <p>Cadastrar médicos, secretários e gerenciar permissões</p>
              </div>

              <div className="feature-card" onClick={async () => {
                setShowReports(true);
                setLoadingReports(true);
                setReportError('');
                try {
                  const data = await fetchAllSchedules();
                  setReports(Array.isArray(data) ? data : []);
                } catch (error) {
                  console.error('Erro ao carregar relatórios:', error);
                  setReportError('Não foi possível carregar os relatórios de consultas.');
                } finally {
                  setLoadingReports(false);
                }
              }} style={{ cursor: 'pointer' }}>
                <h3>📊 Relatórios</h3>
                <p>Visualizar estatísticas e relatórios da clínica</p>
              </div>

              <div className="feature-card">
                <h3>⚙️ Configurações</h3>
                <p>Configurar sistema e preferências</p>
              </div>
            </div>

            {showReports && (
              <div className="reports-section">
                <div className="reports-header">
                  <h3>📋 Relatório de Consultas</h3>
                  <button className="btn btn-secondary" onClick={() => setShowReports(false)}>
                    Fechar Relatórios
                  </button>
                </div>
                {reportError && <div className="alert alert-error">{reportError}</div>}
                {loadingReports ? (
                  <div>Carregando relatórios...</div>
                ) : reports.length === 0 ? (
                  <div>Nenhuma consulta encontrada.</div>
                ) : (
                  <div className="report-table-wrapper">
                    <table className="report-table">
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
                        {reports.map((item) => (
                          <tr key={item.id}>
                            <td>{item.client?.nome || '-'}</td>
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
          </div>
        );

      case 'secretario':
        return (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h2>👋 Olá, {user.nome}!</h2>
              <p>Gerencie os agendamentos e operações da clínica.</p>
            </div>

            <div className="features-grid">
              <div className="feature-card" onClick={() => setShowUserManagement(true)} style={{ cursor: 'pointer' }}>
                <h3>👥 Gerenciar Secretários</h3>
                <p>Cadastrar e gerenciar secretários</p>
              </div>

              <div className="feature-card" onClick={() => navigate('/schedules')} style={{ cursor: 'pointer' }}>
                <h3>📅 Agendar Consulta</h3>
                <p>Agendar novas consultas veterinárias</p>
              </div>

              <div className="feature-card" onClick={() => navigate('/schedules')} style={{ cursor: 'pointer' }}>
                <h3>📋 Gerenciar Consultas</h3>
                <p>Visualizar, filtrar e alterar consultas</p>
              </div>
            </div>
          </div>
        );

      case 'medico':
        return (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h2>👨‍⚕️ Dr. {user.nome}</h2>
              <p>CRM: {user.crmv} | Especialidade: {user.especialidade}</p>
            </div>

            <div className="features-grid">
              <div className="feature-card" onClick={() => navigate('/schedules')} style={{ cursor: 'pointer' }}>
                <h3>📅 Consultas</h3>
                <p>Visualizar agenda e consultas do dia</p>
              </div>

              <div className="feature-card" onClick={() => navigate('/schedules')} style={{ cursor: 'pointer' }}>
                <h3>📋 Prontuários</h3>
                <p>Acessar histórico e registrar prontuários das consultas</p>
              </div>

              <div className="feature-card" onClick={() => navigate('/schedules')} style={{ cursor: 'pointer' }}>
                <h3>💊 Receitas</h3>
                <p>Emitir receituários e prescrições a partir das consultas</p>
              </div>
            </div>
          </div>
        );

      case 'cliente':
        return (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h2>🐾 Olá, {user.nome}!</h2>
              <p>Bem-vindo ao sistema da NewPet</p>
            </div>

            <div className="features-grid">
              <div className="feature-card" onClick={() => setShowAnimalForm(true)} style={{ cursor: 'pointer' }}>
                <h3>🐕 Cadastrar Pet</h3>
                <p>Adicionar um novo animal ao seu cadastro</p>
              </div>

              <div className="feature-card">
                <h3>📅 Agendar Consulta</h3>
                <p>Marcar consultas para seus pets</p>
              </div>

              <div className="feature-card">
                <h3>🐕 Meus Pets</h3>
                <p>Gerenciar cadastro dos animais</p>
              </div>

              <div className="feature-card">
                <h3>📋 Histórico</h3>
                <p>Visualizar consultas anteriores</p>
              </div>
            </div>

            <div className="animais-section">
              <h3>🐾 Meus Animais</h3>
              {loadingAnimais ? (
                <p>Carregando animais...</p>
              ) : animais.length === 0 ? (
                <p>Você ainda não cadastrou nenhum animal.</p>
              ) : (
                <div className="animais-list">
                  {animais.map((animal) => (
                    <div key={animal.id} className="animal-card">
                      <h4>{animal.nome}</h4>
                      <p><strong>Espécie:</strong> {animal.especie}</p>
                      {animal.raca && <p><strong>Raça:</strong> {animal.raca}</p>}
                      {animal.idade && <p><strong>Idade:</strong> {animal.idade} anos</p>}
                      {animal.peso && <p><strong>Peso:</strong> {animal.peso} kg</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Conteúdo não disponível</div>;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>{getDashboardTitle()}</h1>
          <div className="user-info">
            <span className="user-role">{user.tipoUsuario}</span>
            <button onClick={logout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {getDashboardContent()}
      </main>

      {showAnimalForm && (
        <AnimalForm
          onClose={() => setShowAnimalForm(false)}
          onSuccess={(animal) => {
            setAnimais([...animais, animal]);
            setShowAnimalForm(false);
          }}
        />
      )}

      {showUserManagement && (
        <div className="modal-overlay">
          <div className="modal-content">
            <UserManagement />
            <button onClick={() => setShowUserManagement(false)} className="close-modal-button">×</button>
          </div>
        </div>
      )}

      {showAppointmentForm && (
        <AppointmentForm
          onClose={() => setShowAppointmentForm(false)}
          onSuccess={() => setShowAppointmentForm(false)}
        />
      )}

      {showAppointmentList && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AppointmentList />
            <button onClick={() => setShowAppointmentList(false)} className="close-modal-button">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;