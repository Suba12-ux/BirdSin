import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { getInitials } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

export function Profile() {
  const { user, loadUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

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

  if (!user) {
    return <Loader />;
  }

  return (
    <div className="profile">
      <h1 className="page__title profile__title">Мой профиль</h1>

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

      <div className="glass-card profile__card">
        <h3 className="profile__section-title">О проекте</h3>
        <p className="profile__about-text">
          <strong className="profile__accent">Bird</strong> — таинственный
          мессенджер, где стираются границы между реальным и цифровым.
          Анонимные сообщения, минималистичный интерфейс и технологичная
          атмосфера.
        </p>
        <div className="profile__debug">
          user.id: {user.id}
          <br />
          user.email: {user.email}
          <br />
          user.username: {user.username}
        </div>
      </div>
    </div>
  );
}
