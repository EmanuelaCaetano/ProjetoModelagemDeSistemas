import axios from 'axios';

// Configuração do Axios para desenvolvimento
axios.defaults.baseURL = import.meta.env.DEV
  ? '/api'  // Usa proxy do Vite em desenvolvimento
  : 'http://localhost:4000'; // URL direta em produção

// Interceptor para adicionar token de autenticação (futuro)
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default axios;