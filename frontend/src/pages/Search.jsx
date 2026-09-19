import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { getInitials } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

/**
 * Страница поиска собеседника по email.
 * Найденного пользователя можно открыть в чате по клику на карточку.
 */
export function Search() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const query = email.trim();
    if (!query) {
      setError('Введите email пользователя');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await searchAPI.byEmail(query);
      // Эндпоинт пагинирован: в ответе { count, results }
      setResults(response.data.results || response.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось выполнить поиск'));
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page__container page__container--wide glass-card">
        <h1 className="page__title">Поиск собеседника</h1>

        <form className="form search__form" onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="search-email">
              find friends by email
            </label>
            <input
              id="search-email"
              className="form__input"
              type="email"
              name="email"
              placeholder="user@mail.ru"
              value={email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          {error && <p className="form__error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? 'Ищем...' : 'Найти'}
          </button>
        </form>

        {loading && <Loader />}

        {!loading && results !== null && (
          results.length === 0 ? (
            <div className="glass-card text-center search__empty">
              <p className="text-muted">Пользователь с таким email не найден</p>
            </div>
          ) : (
            <div className="users-grid search__results">
              {results.map((u) => (
                <div
                  key={u.id}
                  className="user-card"
                  onClick={() => navigate(`/chat/${u.id}`)}
                >
                  <div className="user-card__avatar">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.first_name} />
                    ) : (
                      getInitials(u)
                    )}
                  </div>
                  <div className="user-card__name truncate">
                    {u.first_name} {u.last_name}
                  </div>
                  <div className="user-card__username">@{u.username}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
