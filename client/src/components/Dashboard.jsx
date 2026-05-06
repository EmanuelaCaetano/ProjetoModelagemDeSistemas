import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import AnimalForm from './AnimalForm';
import UserManagement from './UserManagement';
import axios from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
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
              <div className="feature-card">
                <h3>📅 Consultas</h3>
                <p>Visualizar agenda e consultas do dia</p>
              </div>

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
    </div>
  );
};

export default Dashboard;