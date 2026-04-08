import axios from 'axios';

const isDevelopment = import.meta.env.DEV;

const api = axios.create({
  baseURL: isDevelopment ? '' : (import.meta.env.VITE_API_URL || 'https://puffoff.onrender.com'),
  withCredentials: true,
});

// Attach token from localStorage on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('puffoff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
