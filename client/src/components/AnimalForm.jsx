import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/api';
import './AnimalForm.css';

const AnimalForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
    especie: '',
    raca: '',
    idade: '',
    peso: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/animals', {
        ...formData,
        clienteId: user.id,
        idade: formData.idade ? parseInt(formData.idade) : undefined,
        peso: formData.peso ? parseFloat(formData.peso) : undefined
      });

      if (onSuccess) {
        onSuccess(response.data.animal);
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao cadastrar animal');
    }

    setLoading(false);
  };

  return (
    <div className="animal-form-overlay">
      <div className="animal-form-card">
        <div className="animal-form-header">
          <h2>🐾 Cadastrar Animal</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="animal-form">
          <div className="form-group">
            <label htmlFor="nome">Nome do Animal</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome do pet"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="especie">Espécie</label>
            <select
              id="especie"
              name="especie"
              value={formData.especie}
              onChange={handleChange}
              required
            >
              <option value="">Selecione a espécie</option>
              <option value="Cachorro">Cachorro</option>
              <option value="Gato">Gato</option>
              <option value="Pássaro">Pássaro</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="raca">Raça</label>
            <input
              type="text"
              id="raca"
              name="raca"
              value={formData.raca}
              onChange={handleChange}
              placeholder="Raça (opcional)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idade">Idade (anos)</label>
              <input
                type="number"
                id="idade"
                name="idade"
                value={formData.idade}
                onChange={handleChange}
                placeholder="Idade"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="peso">Peso (kg)</label>
              <input
                type="number"
                id="peso"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                placeholder="Peso"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnimalForm;