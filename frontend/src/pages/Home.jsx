import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { newsAPI, usersAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { NewsCard } from '../components/NewsCard';

/**
 * Home — главная страница: лента новостей всех пользователей.
 * Форма создания новости вынесена на отдельную страницу /news/new.
 */
export function Home() {
  const { user: currentUser } = useAuth();
  const [newsList, setNewsList] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Параллельно грузим новости и список пользователей,
    // чтобы показать авторов (в новости приходит только author.id).
    Promise.all([
      newsAPI.list({ limit: 50 }),
      usersAPI.list({ limit: 100 }),
    ])
      .then(([newsRes, usersRes]) => {
        if (!active) return;
        setNewsList(newsRes.data.results || newsRes.data || []);

        const users = usersRes.data.results || usersRes.data || [];
        const map = {};
        users.forEach((u) => {
          map[u.id] = u;
        });
        // Текущий пользователь не попадает в список пользователей — добавляем вручную.
        if (currentUser) map[currentUser.id] = currentUser;
        setUsersMap(map);
      })
      .catch(() => {
        // Ошибка загрузки — оставляем пустую ленту
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  return (
    <div className="page news-page">
      <div className="page__container page__container--wide">
        <p className="page__subtitle">
          Поделитесь новостью или узнайте, что происходит
        </p>

        <div className="flex items-center justify-between gap-2 news-feed__toolbar">
          <h2 className="news-feed__title news-feed__title--inline">Лента</h2>
          <Link to="/news/new" className="btn btn--primary btn--sm">
            Новая новость
          </Link>
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
              <NewsCard key={n.id} news={n} author={usersMap[n.author]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
