import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../hooks/usePoll';
import { usersAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { getInitials } from '../utils/format';

export function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const response = await usersAPI.list({ limit: 100 });
      setUsers(response.data.results || response.data || []);
    } catch {
      // Ошибка загрузки
    } finally {
      setLoading(false);
    }
  }, []);

  // Первичная загрузка
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Автоматический опрос списка пользователей
  usePoll(loadUsers, 5000, [], { immediate: false });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="page">
      <div className="page__container page__container--wide">
        <h1 className="page__title">Пользователи</h1>
        <p className="page__subtitle">Выберите собеседника и начните общение</p>

        {users.length === 0 ? (
          <div className="glass-card text-center">
            <p className="text-muted">Пока нет зарегистрированных пользователей</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((u) => (
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
        )}
      </div>
    </div>
  );
}
