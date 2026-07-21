import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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
    <AuthContext.Provider value={{ user, loading, login, logout, register, loadUser }}>
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
