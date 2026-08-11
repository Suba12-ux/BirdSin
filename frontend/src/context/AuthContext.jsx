import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePoll } from '../hooks/usePoll';
import { authAPI, usersAPI, notificationsAPI, UNAUTHORIZED_EVENT } from '../api/client';
import { storage } from '../utils/storage';

const EMPTY_NOTIFICATIONS = { total_unread: 0, unread_from: [] };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(EMPTY_NOTIFICATIONS);

  /** Проверить токен и загрузить текущего пользователя */
  const loadUser = useCallback(async () => {
    const token = storage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await usersAPI.me();
      setUser(response.data);
    } catch {
      storage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Загрузить уведомления (непрочитанные сообщения) */
  const loadNotifications = useCallback(async () => {
    const token = storage.getToken();
    if (!token) return;

    try {
      const response = await notificationsAPI.getUnread();
      setNotifications(response.data);
    } catch {
      // Игнорируем ошибки опроса
    }
  }, []);

  /** Первичная загрузка пользователя */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /** Если токен стал невалиден (401) — сбрасываем пользователя */
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setNotifications(EMPTY_NOTIFICATIONS);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  /** Единый таймер: раз в 5 секунд обновляем профиль и уведомления */
  const refresh = useCallback(async () => {
    await Promise.allSettled([loadUser(), loadNotifications()]);
  }, [loadUser, loadNotifications]);

  usePoll(refresh, 5000, [], { immediate: false, enabled: !!user });

  /** Вход: сохраняем токен и загружаем профиль */
  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    storage.setToken(response.data.auth_token);
    await loadUser();
    return response.data.auth_token;
  };

  /** Выход: удаляем токен на сервере и локально */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Игнорируем ошибки при логауте
    } finally {
      storage.clearToken();
      setUser(null);
      setNotifications(EMPTY_NOTIFICATIONS);
    }
  };

  /** Регистрация нового пользователя */
  const register = async (data) => {
    const response = await usersAPI.create(data);
    // После регистрации автоматически логинимся
    await login(data.email, data.password);
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, loadUser, notifications }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
    return context;
}
