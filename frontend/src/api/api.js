import axios from 'axios';

const api = axios.create({
  baseURL: 'https://puffoff.onrender.com',
  withCredentials: true,
});

// Attach token from localStorage on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('puffoff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
