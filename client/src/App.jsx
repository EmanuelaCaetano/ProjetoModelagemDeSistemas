import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ClientDashboard from './components/ClientDashboard';
import SecretarySchedulePage from './pages/schedules/secretary/SecretarySchedulePage';
import ClientSchedulePage from './pages/schedules/client/ClientSchedulePage';
import DoctorSchedulePage from './pages/schedules/doctor/DoctorSchedulePage';
import AdminSchedulesPage from './pages/schedules/admin/AdminSchedulesPage';
import './App.css';

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        Carregando...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Componente principal da aplicação
const AppContent = () => {
  const { user } = useAuth();

  const DashboardComponent = user?.tipoUsuario === 'cliente' ? ClientDashboard : Dashboard;

  const SchedulesPage = () => {
    if (!user) return <Navigate to="/login" />;
    switch (user.tipoUsuario) {
      case 'secretario':
        return <SecretarySchedulePage />;
      case 'administrador':
        return <AdminSchedulesPage />;
      case 'medico':
        return <DoctorSchedulePage />;
      case 'cliente':
        return <ClientSchedulePage />;
      default:
        return <DashboardComponent />;
    }
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardComponent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <SchedulesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedules/my"
            element={
              <ProtectedRoute>
                <ClientSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client"
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
