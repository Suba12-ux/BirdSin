/**
 * Централизованная работа с токеном авторизации.
 * Единственное место, где используется ключ localStorage.
 */
const TOKEN_KEY = 'auth_token';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};
