import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NewsForm } from '../components/NewsForm';
import { newsAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { getErrorMessage } from '../utils/errors';

/**
 * EditNews — отдельная страница для редактирования новости.
 * После сохранения возвращаемся в профиль (к «Моим новостям»).
 */
export function EditNews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    newsAPI
      .get(id)
      .then((res) => {
        if (!active) return;
        // Редактировать можно только свою новость.
        // author приходит вложенным объектом (новый формат),
        // но поддерживаем и старый — просто id.
        const authorId = res.data.author?.id ?? res.data.author;
        if (user && authorId !== user.id) {
          setError('Нельзя редактировать чужую новость.');
          return;
        }
        setNews(res.data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Новость не найдена.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, user]);

  const handleUpdated = () => {
    navigate('/profile');
  };

  if (loading) return <Loader />;

  return (
    <div className="page news-page">
      <div className="page__container page__container--wide">
        <h1 className="page__title">Редактировать новость</h1>
        <p className="page__subtitle">Внесите изменения и сохраните</p>

        {error ? (
          <div className="glass-card">
            <p className="form__error">{error}</p>
          </div>
        ) : (
          <div className="glass-card">
            <NewsForm initialData={news} onUpdated={handleUpdated} />
          </div>
        )}
      </div>
    </div>
  );
}
