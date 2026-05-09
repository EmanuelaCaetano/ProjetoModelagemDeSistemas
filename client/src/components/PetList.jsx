import { useState, useEffect } from 'react';
import PetCard from './PetCard';
import PetForm from './PetForm';
import petService from '../services/petService';
import './PetList.css';

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petService.listMyPets();
      setPets(data.pets || []);
    } catch (err) {
      setError('Erro ao carregar pets. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (petData) => {
    try {
      setError(null);
      if (editingPet) {
        // Atualizar pet existente
        await petService.updatePet(editingPet.id, petData);
        showMsg('Pet atualizado com sucesso! 🎉');
      } else {
        // Criar novo pet
        await petService.createPet(petData);
        showMsg('Pet criado com sucesso! 🎉');
      }
      setShowForm(false);
      setEditingPet(null);
      loadPets();
    } catch (err) {
      setError(editingPet ? 'Erro ao atualizar pet' : 'Erro ao criar pet');
      console.error(err);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };

  const handleDelete = async (petId) => {
    if (window.confirm('Tem certeza que deseja deletar este pet?')) {
      try {
        setError(null);
        await petService.deletePet(petId);
        showMsg('Pet deletado com sucesso!');
        loadPets();
      } catch (err) {
        setError('Erro ao deletar pet');
        console.error(err);
      }
    }
  };

  const handleView = (petId) => {
    // Pode ser expandido para mostrar detalhes mais completos
    console.log('Visualizando pet:', petId);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPet(null);
  };

  const showMsg = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="pet-list-container">
      <div className="pet-list-header">
        <h2>🐾 Meus Pets</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingPet(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? '❌ Fechar' : '➕ Adicionar Pet'}
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message-box">{error}</div>}

      {showForm && (
        <div className="pet-form-container">
          <PetForm
            pet={editingPet}
            onSubmit={handleCreateOrUpdate}
            onCancel={handleCancel}
          />
        </div>
      )}

      {loading ? (
        <div className="loading">
          <p>⏳ Carregando seus pets...</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="empty-state">
          <p>🐾 Você ainda não tem pets cadastrados</p>
          <p>Clique em "Adicionar Pet" para começar!</p>
        </div>
      ) : (
        <div className="pet-grid">
          {pets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PetList;
