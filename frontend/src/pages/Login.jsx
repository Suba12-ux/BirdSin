import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';

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
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Неверный email или пароль'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--login">
      <img className="auth-page__bg" src="/templates/bird_registrate_no_text.png" alt="" aria-hidden="true" />
      <div className="auth-page__container">
        <div className="auth-page__brand">
          <img className="auth-page__logo" src="/templates/bird_logo.ico" alt="Bird logo" />
          <h1 className="auth-page__title">Bird</h1>
        </div>

        <div className="glass-card">
          <form className="form" onSubmit={handleSubmit}>
            <h2 className="text-center mb-1">Вход</h2>

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
