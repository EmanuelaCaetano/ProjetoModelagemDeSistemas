/**
 * EXEMPLO DE INTEGRAÇÃO DO CHATBOT NO APP.JSX
 * 
 * Este arquivo mostra como integrar o componente ChatWindow
 * nas rotas da aplicação, com proteção baseada em role do usuário.
 */

import { ChatWindow } from './components/chatbot';
import { ClientChatPage } from './pages/ClientChatPage';
import { AdminChatPage } from './pages/AdminChatPage';

// ============================================================================
// OPTION 1: Adicionar rotas diretas no Router (método recomendado)
// ============================================================================

/*
No seu App.jsx, adicione estas rotas dentro do componente AppContent():

    <Route
      path="/chat"
      element={
        <ProtectedRoute>
          {user?.tipoUsuario === 'cliente' ? (
            <ClientChatPage apiUrl="http://localhost:4000" />
          ) : (
            <Navigate to="/dashboard" />
          )}
        </ProtectedRoute>
      }
    />

    <Route
      path="/chat/admin"
      element={
        <ProtectedRoute>
          {user?.tipoUsuario === 'administrador' ? (
            <AdminChatPage apiUrl="http://localhost:4000" />
          ) : (
            <Navigate to="/dashboard" />
          )}
        </ProtectedRoute>
      }
    />
*/

// ============================================================================
// OPTION 2: Integrar como modal flutuante no Dashboard
// ============================================================================

/*
No seu componente Dashboard, adicione:

import { useState } from 'react';
import { ChatWindow } from './chatbot';

export default function Dashboard() {
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();

  return (
    <div className="dashboard">
      {/* Seu conteúdo do dashboard */}

      {showChat && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '400px',
          height: '600px',
          boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
          borderRadius: '12px 12px 0 0',
        }}>
          <ChatWindow
            userRole={user?.tipoUsuario === 'cliente' ? 'client' : 'admin'}
            title="Assistente IA"
            apiUrl="http://localhost:4000"
            onClose={() => setShowChat(false)}
          />
        </div>
      )}

      <button
        onClick={() => setShowChat(!showChat)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🤖
      </button>
    </div>
  );
}
*/

// ============================================================================
// OPTION 3: Integrar como parte da sidebar
// ============================================================================

/*
Crie um novo componente:

// components/ChatSidebar.jsx
import { useState } from 'react';
import { ChatWindow } from './chatbot';

export function ChatSidebar({ userRole }) {
  return (
    <div style={{
      width: '350px',
      borderLeft: '1px solid #dee2e6',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <ChatWindow
        userRole={userRole === 'cliente' ? 'client' : 'admin'}
        title="Assistente"
        apiUrl="http://localhost:4000"
      />
    </div>
  );
}

// Use no Layout:
import { ChatSidebar } from './ChatSidebar';

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        {/* Conteúdo principal */}
      </div>
      
      <ChatSidebar userRole={user?.tipoUsuario} />
    </div>
  );
}
*/

// ============================================================================
// OPTION 4: Integrar com Tabs
// ============================================================================

/*
No seu Dashboard, adicione:

import { useState } from 'react';
import { ChatWindow } from './chatbot';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // ou 'chat'
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Visão Geral
        </button>
        <button
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => setActiveTab('chat')}
        >
          🤖 Assistente
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            {/* Conteúdo de visão geral */}
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatWindow
            userRole={user?.tipoUsuario === 'cliente' ? 'client' : 'admin'}
            apiUrl="http://localhost:4000"
          />
        )}
      </div>
    </div>
  );
}
*/

// ============================================================================
// INFORMAÇÕES IMPORTANTES
// ============================================================================

/*
1. AUTENTICAÇÃO
   - O chatbot usa o JWT token do localStorage
   - Certifique-se de que o token está sendo armazenado após login
   - Key: localStorage.getItem('token')

2. ROLE DO USUÁRIO
   - 'cliente' ou 'administrador'
   - Determina quais ferramentas estão disponíveis
   - Importante para segurança

3. ENDPOINTS
   - Cliente: POST /chat/client
   - Admin: POST /chat/admin
   - Histórico: GET /chat/history

4. VARIÁVEIS DE AMBIENTE
   - VITE_API_URL ou apiUrl prop
   - Deve apontar para http://localhost:4000 (dev)
   - Em produção: https://seu-backend.com

5. RESPONSIVIDADE
   - O componente é fully responsive
   - Testa bem em mobile, tablet, desktop

6. PERSONALIZAÇÕES
   - Título customizável via prop 'title'
   - Cores podem ser alteradas no CSS
   - Comportamento extensível via hooks
*/

// ============================================================================
// VERIFICAÇÃO DE SETUP
// ============================================================================

/*
Checklist antes de colocar em produção:

✅ OpenAI API Key configurada no backend
✅ JWT Token siendo armazenado após login
✅ Rotas do chatbot adicionadas no App.jsx
✅ Proteção de rota implementada
✅ Role do usuário verificado
✅ Histórico salvando no banco
✅ Ferramentas executando corretamente
✅ Styling responsivo funcionando
✅ Erros sendo tratados graciosamente
✅ Tests passando
*/

export { ClientChatPage, AdminChatPage };
