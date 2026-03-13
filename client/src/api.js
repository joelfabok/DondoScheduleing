import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return '/api';

  let url = value.trim();
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    url = `https://${url}`;
  }

  if (!url.endsWith('/api')) {
    url = `${url.replace(/\/$/, '')}/api`;
  }

  return url;
};

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
