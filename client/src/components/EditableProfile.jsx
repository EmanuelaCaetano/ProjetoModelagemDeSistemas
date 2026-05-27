import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/api';
import './EditableProfile.css';

const EditableProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    endereco: user?.endereco || ''
  });

  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    senhaNova: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    setFormData({
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      endereco: user?.endereco || ''
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateFormData = () => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (formData.telefone && !/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
      setError('Telefone deve ter 10 ou 11 dígitos');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateFormData()) return;

    setLoading(true);
    try {
      await axios.put('/auth/profile', formData);
      
      // Atualizar contexto do usuário
      if (updateUser) {
        updateUser({ ...user, ...formData });
      }

      setSuccess('Perfil atualizado com sucesso! ✓');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordData = () => {
    if (!passwordData.senhaAtual) {
      setError('Digite sua senha atual');
      return false;
    }
    if (!passwordData.senhaNova) {
      setError('Digite a nova senha');
      return false;
    }
    if (passwordData.senhaNova.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (passwordData.senhaNova !== passwordData.confirmarSenha) {
      setError('As senhas não conferem');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordData()) return;

    setLoading(true);
    try {
      await axios.put('/auth/change-password', {
        senhaAtual: passwordData.senhaAtual,
        senhaNova: passwordData.senhaNova
      });

      setSuccess('Senha atualizada com sucesso! ✓');
      setPasswordData({
        senhaAtual: '',
        senhaNova: '',
        confirmarSenha: ''
      });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setError(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPasswordForm(false);
    setError('');
    setFormData({
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      endereco: user?.endereco || ''
    });
  };

  return (
    <div className="editable-profile-container">
      {/* Alertas */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Seção de Informações Pessoais */}
      <div className="profile-section">
        <div className="section-header">
          <h3>👤 Informações Pessoais</h3>
          {!isEditing && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Editar
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="profile-form">
            <div className="form-group">
              <label htmlFor="nome">Nome Completo *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                className="form-control"
                placeholder="(11) 98765-4321"
              />
            </div>

            <div className="form-group">
              <label htmlFor="endereco">Endereço</label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="form-actions">
              <button
                className="btn btn-success"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Salvando...' : '✓ Salvar Alterações'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-display">
            <div className="profile-item">
              <span className="label">Nome:</span>
              <span className="value">{formData.nome}</span>
            </div>
            <div className="profile-item">
              <span className="label">E-mail:</span>
              <span className="value">{formData.email}</span>
            </div>
            {formData.telefone && (
              <div className="profile-item">
                <span className="label">Telefone:</span>
                <span className="value">{formData.telefone}</span>
              </div>
            )}
            {formData.endereco && (
              <div className="profile-item">
                <span className="label">Endereço:</span>
                <span className="value">{formData.endereco}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seção de Segurança */}
      <div className="profile-section security-section">
        <div className="section-header">
          <h3>🔒 Segurança</h3>
          {!showPasswordForm && (
            <button 
              className="btn btn-warning btn-sm"
              onClick={() => setShowPasswordForm(true)}
            >
              🔑 Alterar Senha
            </button>
          )}
        </div>

        {showPasswordForm && (
          <div className="password-form">
            <div className="form-group">
              <label htmlFor="senhaAtual">Senha Atual *</label>
              <input
                type="password"
                id="senhaAtual"
                name="senhaAtual"
                value={passwordData.senhaAtual}
                onChange={handlePasswordChange}
                className="form-control"
                placeholder="Digite sua senha atual"
              />
            </div>

            <div className="form-group">
              <label htmlFor="senhaNova">Nova Senha *</label>
              <input
                type="password"
                id="senhaNova"
                name="senhaNova"
                value={passwordData.senhaNova}
                onChange={handlePasswordChange}
                className="form-control"
                placeholder="Digite a nova senha"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Nova Senha *</label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={passwordData.confirmarSenha}
                onChange={handlePasswordChange}
                className="form-control"
                placeholder="Confirme a nova senha"
              />
            </div>

            <div className="password-requirements">
              <p className="info-text">Requisitos:</p>
              <ul>
                <li>Mínimo 6 caracteres</li>
                <li>Letras e números recomendados</li>
              </ul>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-warning"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? 'Alterando...' : '🔑 Alterar Senha'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    senhaAtual: '',
                    senhaNova: '',
                    confirmarSenha: ''
                  });
                  setError('');
                }}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {!showPasswordForm && (
          <div className="security-info">
            <p>💡 <strong>Dica de segurança:</strong> Altere sua senha regularmente para manter sua conta protegida.</p>
          </div>
        )}
      </div>

      {/* Informações da Conta */}
      <div className="profile-section account-info">
        <h3>ℹ️ Informações da Conta</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Tipo de Conta:</span>
            <span className="value badge">👤 Cliente</span>
          </div>
          <div className="info-item">
            <span className="label">Membro desde:</span>
            <span className="value">{new Date(user?.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableProfile;
