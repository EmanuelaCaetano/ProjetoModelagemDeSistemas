import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../services/api';
import './AppointmentForm.css';

const AppointmentForm = ({ appointment = null, mode = 'create', onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    animalId: appointment?.animalId || '',
    clienteId: appointment?.clienteId || (user?.tipoUsuario === 'cliente' ? user.id : ''),
    medicoId: appointment?.medicoId || '',
    dataHora: appointment?.dataHora || '',
    observacoes: appointment?.observacoes || ''
  });
  const [animais, setAnimais] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFormData({
      animalId: appointment?.animalId || '',
      clienteId: appointment?.clienteId || (user?.tipoUsuario === 'cliente' ? user.id : ''),
      medicoId: appointment?.medicoId || '',
      dataHora: appointment?.dataHora || '',
      observacoes: appointment?.observacoes || ''
    });
  }, [appointment, user]);

  const fetchData = async () => {
    try {
      // Buscar animais
      if (user?.tipoUsuario === 'cliente') {
        const animaisResponse = await axios.get(`/animals/${user.id}`);
        setAnimais(animaisResponse.data);
      } else {
        // Para secretaria/admin, buscar todos os animais
        const animaisResponse = await axios.get('/animals');
        setAnimais(animaisResponse.data);
      }

      // Buscar clientes (para secretaria/admin)
      if (user?.tipoUsuario !== 'cliente') {
        const clientesResponse = await axios.get('/auth/users');
        setClientes(clientesResponse.data.filter(u => u.tipoUsuario === 'cliente'));
      }

      // Buscar médicos
      const medicosResponse = await axios.get('/auth/users');
      setMedicos(medicosResponse.data.filter(u => u.tipoUsuario === 'medico'));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Erro ao carregar dados necessários');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: value
    };

    if (name === 'clienteId') {
      const animal = animais.find(a => a.id == updatedFormData.animalId);
      if (animal && animal.clienteId != value) {
        updatedFormData.animalId = '';
      }
    }

    setFormData(updatedFormData);
  };

  const handleAnimalChange = (e) => {
    const animalId = e.target.value;
    const animal = animais.find(a => a.id == animalId);
    setFormData({
      ...formData,
      animalId,
      clienteId: animal ? animal.clienteId : formData.clienteId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'edit') {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/appointments', formData);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao agendar consulta');
    }
    setLoading(false);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');

    try {
      await axios.put(`/appointments/${appointment.id}`, formData);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao atualizar consulta');
    }
    setLoading(false);
  };

  const animalsToShow = user?.tipoUsuario !== 'cliente' && formData.clienteId
    ? animais.filter(animal => animal.clienteId == formData.clienteId)
    : animais;

  return (
    <div className="appointment-form-overlay">
      <div className="appointment-form">
        <div className="form-header">
          <h2>{mode === 'edit' ? '✏️ Editar Consulta' : '📅 Agendar Consulta'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="animalId">Animal *</label>
            <select
              id="animalId"
              name="animalId"
              value={formData.animalId}
              onChange={handleAnimalChange}
              required
            >
              <option value="">Selecione um animal</option>
              {animalsToShow.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.nome} ({animal.especie})
                </option>
              ))}
            </select>
          </div>

          {user?.tipoUsuario !== 'cliente' && (
            <div className="form-group">
              <label htmlFor="clienteId">Cliente *</label>
              <select
                id="clienteId"
                name="clienteId"
                value={formData.clienteId}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} ({cliente.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="medicoId">Médico Veterinário *</label>
            <select
              id="medicoId"
              name="medicoId"
              value={formData.medicoId}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione um médico</option>
              {medicos.map(medico => (
                <option key={medico.id} value={medico.id}>
                  Dr. {medico.nome} {medico.especialidade ? `(${medico.especialidade})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dataHora">Data e Hora *</label>
            <input
              type="datetime-local"
              id="dataHora"
              name="dataHora"
              value={formData.dataHora}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              placeholder="Observações adicionais sobre a consulta"
              rows="3"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (mode === 'edit' ? 'Salvando...' : 'Agendando...') : (mode === 'edit' ? 'Salvar Alterações' : 'Agendar Consulta')}
            </button>
          </div>
        </form>

        {showConfirm && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal">
              <h3>Confirmar edição</h3>
              <p>Deseja salvar as alterações nesta consulta? Isso atualizará a agenda de todos os usuários.</p>
              <div className="confirm-actions">
                <button type="button" onClick={() => setShowConfirm(false)} className="cancel-button">
                  Voltar
                </button>
                <button type="button" onClick={handleConfirmSubmit} className="submit-button">
                  Confirmar edição
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentForm;