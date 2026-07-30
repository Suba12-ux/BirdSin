import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePoll } from '../hooks/usePoll';
import { authAPI, usersAPI, notificationsAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    total_unread: 0,
    unread_from: [],
  });

  /** Проверить токен и загрузить текущего пользователя */
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await usersAPI.me();
      setUser(response.data);
    } catch {
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Загрузить уведомления (непрочитанные сообщения) */
  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await notificationsAPI.getUnread();
      setNotifications(response.data);
    } catch {
      // Игнорируем ошибки
    }
  }, []);

  /** Первичная загрузка пользователя */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /** Автоматический опрос данных пользователя каждые 5 секунд */
  usePoll(loadUser, 5000, [], { immediate: false, enabled: !!user });

  /** Автоматический опрос уведомлений каждые 5 секунд */
  usePoll(loadNotifications, 5000, [], { immediate: true, enabled: !!user });

  /** Вход: отправляем email+password, сохраняем токен, загружаем профиль */
  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const token = response.data.auth_token;
    localStorage.setItem('auth_token', token);
    await loadUser();
    return token;
  };

  /** Выход: удаляем токен на сервере и локально */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Игнорируем ошибки при логауте
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setNotifications({ total_unread: 0, unread_from: [] });
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
    <AuthContext.Provider value={{ user, loading, login, logout, register, loadUser, notifications }}>
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
