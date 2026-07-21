import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: добавляем токен авторизации к каждому запросу
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Interceptor: обрабатываем ошибки 401 (неавторизован)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Редирект на страницу логина, если не там уже
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ============ Auth API ============ */

export const authAPI = {
  /** POST /api/auth/token/login/ — вход, получение токена */
  login(email, password) {
    return client.post('/auth/token/login/', { email, password });
  },

  /** POST /api/auth/token/logout/ — выход */
  logout() {
    return client.post('/auth/token/logout/');
  },
};

/* ============ Users API ============ */

export const usersAPI = {
  /** GET /api/users/ — список пользователей */
  list(params = {}) {
    return client.get('/users/', { params });
  },

  /** GET /api/users/{id}/ — детально пользователя */
  get(id) {
    return client.get(`/users/${id}/`);
  },

  /** POST /api/users/ — регистрация нового пользователя */
  create(data) {
    return client.post('/users/', data);
  },

  /** GET /api/users/me/ — текущий пользователь */
  me() {
    return client.get('/users/me/');
  },

  /** PUT /api/users/me/avatar/ — загрузить аватар */
  uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return client.put('/users/me/avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** DELETE /api/users/me/avatar/ — удалить аватар */
  deleteAvatar() {
    return client.delete('/users/me/avatar/');
  },
};

export default client;
