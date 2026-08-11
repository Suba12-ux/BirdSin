import axios from 'axios';
import { storage } from '../utils/storage';

/** Событие: сессия истекла / токен невалиден. AuthContext слушает его. */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен авторизации к каждому запросу
client.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Обрабатываем ошибки 401: очищаем токен и уведомляем приложение,
// чтобы сбросить состояние пользователя без перезагрузки страницы.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
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

/* ============ Messages API ============ */

export const messagesAPI = {
  /** GET /api/messages/?recipient={id} — история переписки */
  list(recipientId) {
    return client.get('/messages/', { params: { recipient: recipientId } });
  },

  /** POST /api/messages/ — отправить сообщение */
  create(data) {
    return client.post('/messages/', data);
  },
};

/* ============ Notifications API ============ */

export const notificationsAPI = {
  /** GET /api/users/me/notifications/ — уведомления (непрочитанные сообщения) */
  getUnread() {
    return client.get('/users/me/notifications/');
  },
};

export default client;
