import { useState, useEffect } from 'react';
import './PetForm.css';

const PetForm = ({ pet = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    especie: '',
    raca: '',
    idade: '',
    peso: '',
    dataNascimento: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const especies = [
    'Cão',
    'Gato',
    'Coelho',
    'Pássaro',
    'Hamster',
    'Tartaruga',
    'Serpente',
    'Peixe',
    'Outro',
  ];

  useEffect(() => {
    if (pet) {
      setFormData({
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        idade: pet.idade.toString(),
        peso: pet.peso.toString(),
        dataNascimento: pet.dataNascimento || '',
      });
    }
  }, [pet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do pet é obrigatório';
    }
    if (!formData.especie) {
      newErrors.especie = 'Espécie é obrigatória';
    }
    if (!formData.raca.trim()) {
      newErrors.raca = 'Raça é obrigatória';
    }
    if (!formData.idade || isNaN(parseFloat(formData.idade))) {
      newErrors.idade = 'Idade deve ser um número válido';
    }
    if (!formData.peso || isNaN(parseFloat(formData.peso))) {
      newErrors.peso = 'Peso deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        idade: parseFloat(formData.idade),
        peso: parseFloat(formData.peso),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="pet-form" onSubmit={handleSubmit}>
      <h3>{pet ? '✏️ Editar Pet' : '➕ Adicionar Novo Pet'}</h3>

      <div className="form-group">
        <label htmlFor="nome">Nome do Pet *</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          placeholder="Ex: Max, Luna..."
          className={errors.nome ? 'input-error' : ''}
        />
        {errors.nome && <span className="error-message">{errors.nome}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="especie">Espécie *</label>
          <select
            id="especie"
            name="especie"
            value={formData.especie}
            onChange={handleChange}
            className={errors.especie ? 'input-error' : ''}
          >
            <option value="">Selecione uma espécie</option>
            {especies.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
          {errors.especie && <span className="error-message">{errors.especie}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="raca">Raça *</label>
          <input
            type="text"
            id="raca"
            name="raca"
            value={formData.raca}
            onChange={handleChange}
            placeholder="Ex: Labrador, Persa..."
            className={errors.raca ? 'input-error' : ''}
          />
          {errors.raca && <span className="error-message">{errors.raca}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="idade">Idade (anos) *</label>
          <input
            type="number"
            id="idade"
            name="idade"
            value={formData.idade}
            onChange={handleChange}
            placeholder="Ex: 3"
            step="0.1"
            min="0"
            className={errors.idade ? 'input-error' : ''}
          />
          {errors.idade && <span className="error-message">{errors.idade}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="peso">Peso (kg) *</label>
          <input
            type="number"
            id="peso"
            name="peso"
            value={formData.peso}
            onChange={handleChange}
            placeholder="Ex: 30.5"
            step="0.1"
            min="0"
            className={errors.peso ? 'input-error' : ''}
          />
          {errors.peso && <span className="error-message">{errors.peso}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="dataNascimento">Data de Nascimento (opcional)</label>
        <input
          type="date"
          id="dataNascimento"
          name="dataNascimento"
          value={formData.dataNascimento}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? '⏳ Salvando...' : pet ? '💾 Atualizar' : '➕ Criar Pet'}
        </button>
        <button 
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ❌ Cancelar
        </button>
      </div>
    </form>
  );
};

export default PetForm;
