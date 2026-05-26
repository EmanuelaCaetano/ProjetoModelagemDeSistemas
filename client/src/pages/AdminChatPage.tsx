import React, { useEffect, useState } from 'react';
import { ChatWindow } from '../components/chatbot/ChatWindow';

interface AdminChatPageProps {
  apiUrl?: string;
}

export const AdminChatPage: React.FC<AdminChatPageProps> = ({ apiUrl = 'http://localhost:4000' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica se o usuário está autenticado como admin
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (token && userRole === 'administrador') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>Acesso Negado</h2>
          <p>Você precisa estar autenticado como administrador para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <ChatWindow
        userRole="admin"
        title="Assistente Administrativo"
        apiUrl={apiUrl}
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  errorBox: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  pageContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '16px',
  },
};
