import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../api/client';

export function About() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    usersAPI
      .list({ limit: 100 })
      .then((response) => {
        if (active) {
          const users = response.data.results || response.data || [];
          // Показываем только разработчиков проекта
          setAuthors(users.filter((u) => u.is_developer));
        }
      })
      .catch(() => {
        // Ошибка загрузки — просто показываем пустой список
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const getInitials = (u) =>
    `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.trim() ||
    u.email?.[0]?.toUpperCase() ||
    '?';

  return (
    <div className="page" style={{ paddingTop: '2rem' }}>
      <div className="page__container page__container--wide">
        <h1 className="page__title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          О проекте
        </h1>

        <div className="glass-card">
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: 1.8,
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Bird</strong> — мессенджер
            с минималистичным интерфейсом и поддержкой анонимных сообщений.
          </p>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.7,
              fontFamily: 'var(--font-mono)',
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginTop: '1rem',
            }}
          >
            Frontend: React 18 + Vite + React Router DOM<br />
            Backend: Django 5 + DRF + PostgreSQL<br />
            Инфра: Docker + Nginx + Gunicorn
          </p>
        </div>

        {/* Авторы проекта */}
        <div className="glass-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Авторы проекта</h3>

          {loading ? (
            <div className="loader">
              <div className="loader__spinner" />
            </div>
          ) : authors.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Пока никого — проект только начинается
            </p>
          ) : (
            <div className="author-list">
              {authors.map((u) => (
                <Link key={u.id} to={`/chat/${u.id}`} className="author-item">
                  <div className="author-item__avatar">
                    {u.avatar ? (
                      <img src={u.avatar} alt={`${u.first_name} ${u.last_name}`} />
                    ) : (
                      getInitials(u)
                    )}
                  </div>
                  <div className="author-item__info">
                    <div className="author-item__name truncate">
                      {u.first_name} {u.last_name}
                    </div>
                    <div className="author-item__username">@{u.username}</div>
                  </div>
                  <span className="author-item__action">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
