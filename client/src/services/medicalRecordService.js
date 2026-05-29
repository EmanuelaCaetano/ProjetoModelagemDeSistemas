import axios from './api';

export async function createMedicalRecord(payload) {
  const response = await axios.post('/medical-records', payload);
  return response.data;
}

export async function fetchMyMedicalRecords() {
  const response = await axios.get('/medical-records/my');
  return response.data;
}

export async function updateMedicalRecord(id, payload) {
  const response = await axios.put(`/medical-records/${id}`, payload);
  return response.data;
}

export async function deleteMedicalRecord(id) {
  const response = await axios.delete(`/medical-records/${id}`);
  return response.data;
}
