import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Валидация на клиенте
    const newErrors = {};
    if (!form.email) newErrors.email = 'Обязательное поле';
    if (!form.username) newErrors.username = 'Обязательное поле';
    if (!form.password || form.password.length < 8) {
      newErrors.password = 'Минимум 8 символов';
    }
    if (!form.first_name) newErrors.first_name = 'Обязательное поле';
    if (!form.last_name) newErrors.last_name = 'Обязательное поле';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate('/chat');
    } catch (err) {
      const serverErrors = err.response?.data || {};
      const mapped = {};
      for (const [key, value] of Object.entries(serverErrors)) {
        mapped[key] = Array.isArray(value) ? value[0] : value;
      }
      setErrors(mapped);
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
          <p className="auth-page__subtitle">Создайте аккаунт</p>
        </div>

        <div className="glass-card">
          <form className="form" onSubmit={handleSubmit}>
            <h2 className="text-center" style={{ marginBottom: '0.5rem' }}>
              Регистрация
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
              />
              {errors.email && <p className="form__error">{errors.email}</p>}
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="username">
                Имя пользователя
              </label>
              <input
                id="username"
                className="form__input"
                type="text"
                name="username"
                placeholder="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
              {errors.username && (
                <p className="form__error">{errors.username}</p>
              )}
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="first_name">
                Имя
              </label>
              <input
                id="first_name"
                className="form__input"
                type="text"
                name="first_name"
                placeholder="Иван"
                value={form.first_name}
                onChange={handleChange}
              />
              {errors.first_name && (
                <p className="form__error">{errors.first_name}</p>
              )}
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="last_name">
                Фамилия
              </label>
              <input
                id="last_name"
                className="form__input"
                type="text"
                name="last_name"
                placeholder="Иванов"
                value={form.last_name}
                onChange={handleChange}
              />
              {errors.last_name && (
                <p className="form__error">{errors.last_name}</p>
              )}
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
                placeholder="Минимум 8 символов"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="form__error">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Создать аккаунт'}
            </button>

            <p className="form__footer">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
