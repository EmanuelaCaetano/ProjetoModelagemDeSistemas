import axios from './api';

export async function fetchAllSchedules() {
  const response = await axios.get('/schedules');
  return response.data;
}

export async function fetchMySchedules() {
  const response = await axios.get('/schedules/my');
  return response.data;
}

export async function bookSchedule(payload) {
  const response = await axios.post('/schedules/book', payload);
  return response.data;
}

export async function createSchedule(payload) {
  const response = await axios.post('/schedules', payload);
  return response.data;
}

export async function updateSchedule(id, payload) {
  const response = await axios.put(`/schedules/${id}`, payload);
  return response.data;
}

export async function cancelSchedule(id) {
  const response = await axios.delete(`/schedules/${id}`);
  return response.data;
}
