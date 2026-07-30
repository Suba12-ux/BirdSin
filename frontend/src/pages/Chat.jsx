import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePoll } from '../hooks/usePoll';
import { usersAPI, messagesAPI } from '../api/client';

/**
 * Chat — страница сообщений (с автоматическим опросом новых сообщений).
 *
 * TODO:
 *  - добавить infinite scroll для истории сообщений
 */
export function Chat() {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Загружаем список пользователей
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await usersAPI.list({ limit: 100 });
        const allUsers = response.data.results || response.data || [];
        // Исключаем себя
        setUsers(allUsers.filter((u) => u.id !== currentUser?.id));
      } catch {
        // Ошибка загрузки пользователей
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [currentUser]);

  // Если в URL есть userId — выбираем его
  useEffect(() => {
    if (userId && users.length > 0) {
      const found = users.find((u) => String(u.id) === userId);
      if (found) {
        setSelectedUser(found);
      }
    }
  }, [userId, users]);

  // Загружаем историю сообщений при выборе собеседника
  const loadMessages = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const response = await messagesAPI.list(selectedUser.id);
      setMessages(response.data.results || response.data || []);
    } catch {
      setMessages([]);
    }
  }, [selectedUser]);

  // Первичная загрузка при выборе собеседника
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Автоматический опрос новых сообщений каждые 3 секунды
  usePoll(loadMessages, 3000, [selectedUser], { immediate: false });

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    navigate(`/chat/${user.id}`);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedUser) return;

    try {
      const response = await messagesAPI.create({
        text,
        recipient: selectedUser.id,
      });
      setMessages((prev) => [...prev, response.data]);
      setInput('');
    } catch {
      // Ошибка отправки
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Инициалы для аватара по умолчанию
  const getInitials = (u) =>
    `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.trim() ||
    u.email?.[0]?.toUpperCase() ||
    '?';

  if (loading) {
    return (
      <div className="loader">
        <div className="loader__spinner" />
      </div>
    );
  }

  return (
    <div className="chat__layout">
      {/* Боковая панель — список пользователей */}
      <aside className="chat__sidebar">
        <div className="chat__sidebar-title">Собеседники</div>
        {users.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
            Пользователей пока нет
          </p>
        ) : (
          <div className="chat__users-panel">
            {users.map((u) => (
              <div
                key={u.id}
                className={`chat__user-item ${
                  selectedUser?.id === u.id ? 'chat__user-item--active' : ''
                }`}
                onClick={() => handleSelectUser(u)}
              >
                <div className="chat__user-avatar">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.first_name} />
                  ) : (
                    getInitials(u)
                  )}
                </div>
                <span className="chat__user-name truncate">
                  {u.first_name} {u.last_name}
                </span>
                {u.unread_count > 0 && (
                  <span className="chat__user-badge">
                    {u.unread_count}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Основная область — чат */}
      <main className="chat__main">
        {!selectedUser ? (
          <div className="chat" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="chat__empty">
              <div className="chat__empty-icon">💬</div>
              <p>Выберите собеседника</p>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Начните таинственный диалог
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Шапка чата */}
            <div className="chat__header" style={{ padding: '1rem 1.5rem' }}>
              <div className="chat__header-avatar">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.first_name} />
                ) : (
                  getInitials(selectedUser)
                )}
              </div>
              <div className="chat__header-info">
                <div className="chat__header-name">
                  {selectedUser.first_name} {selectedUser.last_name}
                </div>
                <div className="chat__header-status">
                  @{selectedUser.username}
                </div>
              </div>
            </div>

            {/* Сообщения */}
            <div className="chat" style={{ padding: '1rem 1.5rem' }}>
              <div className="chat__messages">
                {messages.length === 0 ? (
                  <div className="chat__empty">
                    <div className="chat__empty-icon">🕊️</div>
                    <p>История сообщений пуста</p>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Напишите что-нибудь...
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOutgoing = msg.author === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`chat__message ${
                          isOutgoing
                            ? 'chat__message--outgoing'
                            : 'chat__message--incoming'
                        }`}
                      >
                        <div>{msg.text}</div>
                        <div className="chat__message-time">
                          {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Поле ввода */}
              <div className="chat__input-area">
                <textarea
                  className="chat__input"
                  rows={2}
                  placeholder={
                    selectedUser
                      ? `Написать ${selectedUser.first_name}...`
                      : 'Выберите собеседника...'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!selectedUser}
                />
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleSend}
                  disabled={!input.trim() || !selectedUser}
                >
                  →
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}