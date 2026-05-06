import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, senha);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏥 NewPet</h1>
          <h2>Clínica Veterinária</h2>
          <p>Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>Não tem conta? <a href="/register">Cadastre-se</a></p>
          <h3>Usuários de Teste:</h3>
          <div className="test-users">
            <div className="test-user">
              <strong>Admin:</strong> admin@newpet.com / Admin@123
            </div>
            <div className="test-user">
              <strong>Médico:</strong> medico@newpet.com / Medico@123
            </div>
            <div className="test-user">
              <strong>Secretária:</strong> secretaria@newpet.com / Secretaria@123
            </div>
            <div className="test-user">
              <strong>Cliente:</strong> cliente@newpet.com / Cliente@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;