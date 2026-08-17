import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { getInitials } from '../utils/format';

export function About() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAuthors = async () => {
      try {
        // Публичный эндпоинт: работает и для неавторизованных.
        // Сервер уже отдаёт только разработчиков проекта (is_developer).
        const response = await usersAPI.developers();
        if (!active) return;
        setAuthors(response.data || []);
      } catch {
        // Ошибка загрузки — просто показываем пустой список
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAuthors();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page about">
      <div className="page__container page__container--wide">
        <h1 className="page__title about__title">О проекте</h1>

        <div className="glass-card">
          <p className="about__text">
            <strong className="about__accent">Bird</strong> — мессенджер
            с минималистичным интерфейсом и поддержкой анонимных сообщений.
            <br />
            <span className="about__note">
              <h6>
                P.S. Хочешь поучаствовать — пиши автору, будем рады любой помощи =)
              </h6>
            </span>
          </p>
          <div className="about__tech">
            Frontend: React 18 + Vite + React Router DOM
            <br />
            Backend: Django 5 + DRF + PostgreSQL
            <br />
            Инфра: Docker + Nginx + Gunicorn
          </div>
        </div>

        {/* Авторы проекта */}
        <div className="glass-card about__authors">
          <h3 className="about__authors-title">Авторы проекта</h3>

          {loading ? (
            <Loader />
          ) : authors.length === 0 ? (
            <p className="text-muted about__empty">
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
