import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/client';

export function Profile() {
  const { user, loadUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.trim() ||
      user.email?.[0]?.toUpperCase() ||
      '?'
    : '?';

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const response = await usersAPI.uploadAvatar(file);
      await loadUser(); // перезагружаем профиль
      setMessage({ type: 'success', text: 'Аватар обновлён' });
    } catch (err) {
      const errorText =
        err.response?.data?.avatar?.[0] ||
        'Ошибка при загрузке аватара';
      setMessage({ type: 'error', text: errorText });
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
    return (
      <div className="loader">
        <div className="loader__spinner" />
      </div>
    );
  }

  return (
    <div className="profile">
      <h1 className="page__title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Мой профиль
      </h1>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="profile__header">
          <div className="profile__avatar" onClick={handleAvatarClick}>
            {user.avatar ? (
              <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
            ) : (
              initials
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
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              @{user.username}
            </div>
          </div>
        </div>

        {/* Скрытый input для загрузки файла */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {user.avatar && (
          <div style={{ marginTop: '0.5rem' }}>
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
          <div className={`toast toast--${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>О проекте</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Bird</strong> — 
          таинственный мессенджер, где стираются границы между реальным 
          и цифровым. Анонимные сообщения, минималистичный интерфейс 
          и технологичная атмосфера.
        </p>
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            wordBreak: 'break-all',
          }}
        >
          user.id: {user.id}<br />
          user.email: {user.email}<br />
          user.username: {user.username}
        </div>
      </div>
    </div>
  );
}
