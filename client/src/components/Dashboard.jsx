import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const getDashboardTitle = () => {
    switch (user.tipoUsuario) {
      case 'administrador':
        return 'Painel Administrativo';
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
              <div className="feature-card">
                <h3>👥 Gerenciar Usuários</h3>
                <p>Cadastrar médicos, secretários e gerenciar permissões</p>
              </div>

              <div className="feature-card">
                <h3>📊 Relatórios</h3>
                <p>Visualizar estatísticas e relatórios da clínica</p>
              </div>

              <div className="feature-card">
                <h3>⚙️ Configurações</h3>
                <p>Configurar sistema e preferências</p>
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
              <Link to="/agenda" className="feature-card-link">
                <div className="feature-card">
                  <h3>📅 Consultas</h3>
                  <p>Visualizar agenda e consultas do dia</p>
                </div>
              </Link>

              <div className="feature-card">
                <h3>📋 Prontuários</h3>
                <p>Acessar histórico dos pacientes</p>
              </div>

              <div className="feature-card">
                <h3>💊 Receitas</h3>
                <p>Emitir receitas e prescrições</p>
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
    </div>
  );
};

export default Dashboard;