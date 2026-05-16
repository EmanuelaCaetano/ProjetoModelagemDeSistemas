import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PetList from './PetList';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

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
          className={`tab-button ${activeTab === 'pets' ? 'active' : ''}`}
          onClick={() => setActiveTab('pets')}
        >
          🐾 Meus Pets
        </button>
        <button
          className={`tab-button ${activeTab === 'consultas' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultas')}
        >
          📅 Minhas Consultas
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

              <div className="action-card" onClick={() => setActiveTab('consultas')}>
                <div className="action-icon">📅</div>
                <h3>Agendar Consulta</h3>
                <p>Marcar uma consulta com nossos veterinários</p>
              </div>

              <div className="action-card" onClick={() => setActiveTab('consultas')}>
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
            <div className="placeholder-content">
              <p>💬 Funcionalidade de consultas em desenvolvimento</p>
              <p>Em breve você poderá agendar e gerenciar suas consultas aqui!</p>
            </div>
          </div>
        )}

        {/* Perfil */}
        {activeTab === 'perfil' && (
          <div className="tab-pane perfil-tab">
            <h2>👤 Meu Perfil</h2>
            <div className="profile-card">
              <div className="profile-field">
                <label>Nome</label>
                <p>{user.nome}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              {user.telefone && (
                <div className="profile-field">
                  <label>Telefone</label>
                  <p>{user.telefone}</p>
                </div>
              )}
              {user.endereco && (
                <div className="profile-field">
                  <label>Endereço</label>
                  <p>{user.endereco}</p>
                </div>
              )}
              <div className="profile-actions">
                <p className="info-text">ℹ️ Recursos de edição em desenvolvimento</p>
              </div>
            </div>
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
