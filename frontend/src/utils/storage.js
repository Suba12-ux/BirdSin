/**
 * Централизованная работа с localStorage приложения.
 * Единственное место, где используются ключи хранилища.
 *
 * Учёт согласия на cookie здесь не ведётся: решение пользователя хранит
 * backend (django-cookie-consent) в cookie `cookie_consent`.
 */
const TOKEN_KEY = 'auth_token';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};
