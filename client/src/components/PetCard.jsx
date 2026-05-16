import './PetCard.css';

const PetCard = ({ pet, onEdit, onDelete, onView }) => {
  const getEspecieIcon = (especie) => {
    const icons = {
      'Cão': '🐕',
      'Gato': '🐱',
      'Coelho': '🐰',
      'Pássaro': '🐦',
      'Hamster': '🐹',
      'Tartaruga': '🐢',
      'Serpente': '🐍',
      'Peixe': '🐠',
    };
    return icons[especie] || '🐾';
  };

  return (
    <div className="pet-card">
      <div className="pet-card-header">
        <div className="pet-icon">{getEspecieIcon(pet.especie)}</div>
        <div className="pet-info-header">
          <h3>{pet.nome}</h3>
          <p className="pet-especie">{pet.especie} - {pet.raca}</p>
        </div>
      </div>

      <div className="pet-details">
        <div className="detail-item">
          <span className="label">Idade:</span>
          <span className="value">{pet.idade} anos</span>
        </div>
        <div className="detail-item">
          <span className="label">Peso:</span>
          <span className="value">{pet.peso} kg</span>
        </div>
        {pet.dataNascimento && (
          <div className="detail-item">
            <span className="label">Data de Nascimento:</span>
            <span className="value">{new Date(pet.dataNascimento).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      <div className="pet-card-actions">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onView(pet.id)}
          title="Ver detalhes"
        >
          👁️ Ver
        </button>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onEdit(pet)}
          title="Editar"
        >
          ✏️ Editar
        </button>
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(pet.id)}
          title="Deletar"
        >
          🗑️ Deletar
        </button>
      </div>
    </div>
  );
};

export default PetCard;
