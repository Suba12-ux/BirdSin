import { useRef, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, newsAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { NewsCard } from '../components/NewsCard';
import { getInitials } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

export function Profile() {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [myNews, setMyNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      await usersAPI.uploadAvatar(file);
      await loadUser(); // перезагружаем профиль
      setMessage({ type: 'success', text: 'Аватар обновлён' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Ошибка при загрузке аватара') });
    } finally {
      setUploading(false);
      // Сброс input, чтобы можно было выбрать тот же файл повторно
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    setUploading(true);
    setMessage(null);

    try {
      await usersAPI.deleteAvatar();
      await loadUser();
      setMessage({ type: 'success', text: 'Аватар удалён' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при удалении аватара' });
    } finally {
      setUploading(false);
    }
  };

  /** Загрузка новостей текущего пользователя */
  const loadMyNews = useCallback(async () => {
    try {
      const response = await newsAPI.myNews({ limit: 50 });
      setMyNews(response.data.results || response.data || []);
    } catch {
      setMyNews([]);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyNews();
  }, [loadMyNews]);

  /** Удаление своей новости */
  const handleDeleteNews = async (id) => {
    try {
      await newsAPI.remove(id);
      setMyNews((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Ошибка удаления — оставляем новость на месте
    }
  };

  if (!user) {
    return <Loader />;
  }
// profile__avatar
  return (
    <div className="profile">
      <div className="glass-card profile__card">
        <div className="profile__header">
          <div className="profile__avatar" onClick={handleAvatarClick}>
            {user.avatar ? (
              <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
            ) : (
              getInitials(user)
            )}
            <div className="profile__avatar-overlay">
              {uploading ? '...' : '✎'}
            </div>
          </div>
          <div>
            <div className="profile__name">
              {user.first_name} {user.last_name}
            </div>
            <div className="profile__email">{user.email}</div>
            <div className="profile__username">@{user.username}</div>
          </div>
        </div>

        {/* Скрытый input для загрузки файла */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={handleFileChange}
        />

        {user.avatar && (
          <div className="profile__avatar-actions">
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={handleDeleteAvatar}
              disabled={uploading}
            >
              Удалить аватар
            </button>
          </div>
        )}

        {message && (
          <div className={`toast toast--${message.type}`}>{message.text}</div>
        )}
      </div>

      <div className="profile__news-section">
        <div className="profile__news-header">
          {/* <h3 className="profile__section-title">Мои новости</h3> */}
          <Link to="/news/new" className="btn btn--primary btn--sm">
            Новая новость
          </Link>
        </div>

        {newsLoading ? (
          <Loader />
        ) : myNews.length === 0 ? (
          <div className="glass-card">
            <p className="text-muted profile__news-empty">
              У вас пока нет новостей. Опубликуйте первую на главной странице.
            </p>
          </div>
        ) : (
          <div className="news-feed">
            {myNews.map((n) => (
              <NewsCard
                key={n.id}
                news={n}
                author={user}
                canDelete
                canEdit
                onDelete={handleDeleteNews}
                onEdit={(id) => navigate(`/news/edit/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
