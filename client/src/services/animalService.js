import axios from './api';

export async function fetchAllAnimals() {
  const response = await axios.get('/animals');
  return response.data;
}

export async function fetchAnimalsByClient(clienteId) {
  const response = await axios.get(`/animals/${clienteId}`);
  return response.data;
}
