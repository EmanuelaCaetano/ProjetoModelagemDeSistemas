import api from './api';

const PET_API_URL = '/pets';

export const petService = {
  // Criar um novo pet
  createPet: async (petData) => {
    try {
      const response = await api.post(PET_API_URL, petData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pet:', error);
      throw error;
    }
  },

  // Listar todos os pets do cliente
  listMyPets: async () => {
    try {
      const response = await api.get(PET_API_URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar pets:', error);
      throw error;
    }
  },

  // Obter detalhes de um pet específico
  getPetById: async (petId) => {
    try {
      const response = await api.get(`${PET_API_URL}/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pet:', error);
      throw error;
    }
  },

  // Atualizar um pet
  updatePet: async (petId, petData) => {
    try {
      const response = await api.put(`${PET_API_URL}/${petId}`, petData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar pet:', error);
      throw error;
    }
  },

  // Deletar um pet
  deletePet: async (petId) => {
    try {
      const response = await api.delete(`${PET_API_URL}/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar pet:', error);
      throw error;
    }
  }
};

export default petService;
