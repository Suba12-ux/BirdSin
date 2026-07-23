import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      navigate('/chat');
    } catch (err) {
      const detail =
        err.response?.data?.non_field_errors?.[0] ||
        'Неверный email или пароль';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__brand">
          <div className="auth-page__logo">B</div>
          <h1 className="auth-page__title">Bird</h1>
          <p className="auth-page__subtitle">Таинственные сообщения</p>
        </div>

        <div className="glass-card">
          <form className="form" onSubmit={handleSubmit}>
            <h2 className="text-center" style={{ marginBottom: '0.5rem' }}>
              Вход
            </h2>

            <div className="form__group">
              <label className="form__label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="form__input"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                className="form__input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="form__error">{error}</p>}

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>

            <p className="form__footer">
              Нет аккаунта?{' '}
              <Link to="/register">Зарегистрироваться</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
