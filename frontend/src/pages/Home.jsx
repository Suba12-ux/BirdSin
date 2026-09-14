import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { newsAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { NewsCard } from '../components/NewsCard';

/**
 * Home — главная страница: лента новостей всех пользователей.
 * Форма создания новости вынесена на отдельную страницу /news/new.
 */
export function Home() {
  const { user: currentUser } = useAuth();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Новости доступны всем, включая неавторизованных (list — AllowAny).
    // Автор приходит вместе с новостью (вложенный объект), поэтому
    // отдельный запрос к /api/users/ не нужен: он возвращает 401 гостям
    // и раньше блокировал загрузку всей ленты через Promise.all.
    newsAPI
      .list({ limit: 50 })
      .then((newsRes) => {
        if (!active) return;
        setNewsList(newsRes.data.results || newsRes.data || []);
      })
      .catch(() => {
        if (active) setNewsList([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page news-page">
      <div className="page__container page__container--wide">

        <div className="flex items-center justify-between gap-2 news-feed__toolbar">
          <h2 className="news-feed__title news-feed__title--inline">Лента</h2>
          {currentUser && (
            <Link to="/news/new" className="btn btn--primary btn--sm">
              Новая новость
            </Link>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : newsList.length === 0 ? (
          <div className="glass-card">
            <p className="text-muted news-feed__empty">
              Пока нет новостей — станьте первым!
            </p>
          </div>
        ) : (
          <div className="news-feed">
            {newsList.map((n) => (
              <NewsCard key={n.id} news={n} author={n.author} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
