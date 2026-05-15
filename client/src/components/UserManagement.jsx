import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: user?.tipoUsuario === 'administrador' ? 'medico' : 'secretario',
    telefone: '',
    endereco: '',
    crmv: '',
    especialidade: '',
    nivelAcesso: ''
  });
  const [error, setError] = useState('');

  // Verificar se o usuário pode gerenciar médicos
  const canManageMedicos = user?.tipoUsuario === 'administrador';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/auth/users');
      // Filtrar usuários baseado no nível de acesso
      let filteredUsers = response.data.filter(u => u.tipoUsuario !== 'cliente');
      
      if (user?.tipoUsuario === 'secretario') {
        // Secretários só podem ver outros secretários
        filteredUsers = filteredUsers.filter(u => u.tipoUsuario === 'secretario');
      }
      // Administradores veem todos (médicos e secretários)
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        const response = await axios.put(`/auth/users/${editingUser.id}`, formData);
        setUsers(users.map(u => u.id === editingUser.id ? response.data.usuario : u));
        setShowForm(false);
        resetForm();
      } else {
        const response = await axios.post('/auth/register', formData);
        setUsers([...users, response.data.usuario]);
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      role: 'medico',
      telefone: '',
      endereco: '',
      crmv: '',
      especialidade: '',
      nivelAcesso: ''
    });
    setEditingUser(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: '', // Não mostrar senha
      role: user.tipoUsuario,
      telefone: user.telefone || '',
      endereco: user.endereco || '',
      crmv: user.crmv || '',
      especialidade: user.especialidade || '',
      nivelAcesso: user.nivelAcesso || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      try {
        await axios.delete(`/auth/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Erro ao remover usuário:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Carregando usuários...</div>;
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>👥 {canManageMedicos ? 'Gerenciamento de Usuários' : 'Gerenciamento de Secretários'}</h2>
        <button onClick={() => setShowForm(true)} className="add-button">
          + Novo {canManageMedicos ? 'Usuário' : 'Secretário'}
        </button>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <p>Nenhum usuário cadastrado ainda.</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="user-card">
              <div className="user-info">
                <h3>{u.nome}</h3>
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Tipo:</strong> {u.tipoUsuario}</p>
                {u.telefone && <p><strong>Telefone:</strong> {u.telefone}</p>}
                {u.crmv && <p><strong>CRMV:</strong> {u.crmv}</p>}
                {u.especialidade && <p><strong>Especialidade:</strong> {u.especialidade}</p>}
              </div>
              <div className="user-actions">
                <button onClick={() => handleEdit(u)} className="edit-button">
                  Editar
                </button>
                <button onClick={() => handleDelete(u.id)} className="delete-button">
                  Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-card">
            <div className="form-header">
              <h3>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="close-button">×</button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
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
                    required
                  />
                </div>
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label htmlFor="senha">Senha *</label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Tipo de Usuário *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    {canManageMedicos ? (
                      <>
                        <option value="medico">Médico Veterinário</option>
                        <option value="secretario">Secretário</option>
                        <option value="administrador">Administrador</option>
                      </>
                    ) : (
                      <option value="secretario">Secretário</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="endereco">Endereço</label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                />
              </div>

              {formData.role === 'medico' && canManageMedicos && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="crmv">CRMV</label>
                    <input
                      type="text"
                      id="crmv"
                      name="crmv"
                      value={formData.crmv}
                      onChange={handleInputChange}
                      placeholder="CRMV-12345"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="especialidade">Especialidade</label>
                    <input
                      type="text"
                      id="especialidade"
                      name="especialidade"
                      value={formData.especialidade}
                      onChange={handleInputChange}
                      placeholder="Clínica Geral"
                    />
                  </div>
                </div>
              )}

              {(formData.role === 'administrador' || formData.role === 'secretario') && (
                <div className="form-group">
                  <label htmlFor="nivelAcesso">Nível de Acesso</label>
                  <select
                    id="nivelAcesso"
                    name="nivelAcesso"
                    value={formData.nivelAcesso}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="total">Total</option>
                    <option value="parcial">Parcial</option>
                  </select>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="cancel-button">
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  {editingUser ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;