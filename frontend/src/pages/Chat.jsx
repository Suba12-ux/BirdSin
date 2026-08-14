import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePoll } from '../hooks/usePoll';
import { usersAPI, messagesAPI } from '../api/client';
import { Loader } from '../components/Loader';
import { getInitials } from '../utils/format';

const POLL_INTERVAL = 3000;

/**
 * Chat — страница сообщений (с автоматическим опросом новых сообщений).
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
  const messagesContainerRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  // Список собеседников без текущего пользователя
  const interlocutors = useMemo(
    () => users.filter((u) => u.id !== currentUser?.id),
    [users, currentUser]
  );

  // Загружаем список собеседников: только те, с кем уже есть переписка
  const loadUsers = useCallback(async () => {
    try {
      const response = await usersAPI.list({ limit: 100, with_chat: true });
      setUsers(response.data.results || response.data || []);
    } catch {
      // Ошибка загрузки пользователей
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadUsers().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [loadUsers]);

  // Если в URL есть userId — выбираем его
  useEffect(() => {
    if (!userId) return;

    // Нельзя открыть чат с самим собой
    if (currentUser && String(userId) === String(currentUser.id)) {
      navigate('/chat');
      return;
    }

    const found = interlocutors.find((u) => String(u.id) === userId);
    if (found) {
      setSelectedUser(found);
    } else if (!loading) {
      // Собеседника нет в списке (например, прямой переход по ссылке) — грузим напрямую
      usersAPI
        .get(userId)
        .then((res) => setSelectedUser(res.data))
        .catch(() => {
          // Невалидный id — оставляем пустой выбор
        });
    }
  }, [userId, interlocutors, loading, currentUser, navigate]);

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

  // Автоматический опрос новых сообщений
  usePoll(loadMessages, POLL_INTERVAL, [selectedUser], { immediate: false });

  /**
   * Находится ли пользователь уже «у самого низа» переписки.
   * Если да — при новых сообщениях прокручиваем вниз,
   * если нет (читает историю) — не выдёргиваем его вниз.
   */
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight < 100
    );
  }, []);

  /**
   * Автопрокрутка вниз.
   *
   * Раньше эффект зависел от [messages] и срабатывал при КАЖДОМ опросе
   * (раз в 3 секунды), потому что loadMessages каждый раз создавал новый
   * массив. Из-за этого страница постоянно «прыгала» вниз.
   * Теперь скроллим только когда появилось реально новое сообщение.
   */
  useEffect(() => {
    const container = messagesContainerRef.current;
    const lastMessage = messages[messages.length - 1];
    if (!container || !lastMessage) return;

    // Это тот же набор сообщений (обычный опрос) — ничего не делаем
    if (lastMessage.id === lastMessageIdRef.current) return;

    lastMessageIdRef.current = lastMessage.id;

    // При первом открытии диалога всегда показываем последнее сообщение,
    // при последующих обновлениях — только если пользователь уже у низа.
    if (isFirstLoadRef.current || isNearBottom()) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
    isFirstLoadRef.current = false;
  }, [messages, isNearBottom]);

  // Смена собеседника: сбрасываем состояние автопрокрутки,
  // чтобы новая переписка открылась с последнего сообщения.
  useEffect(() => {
    lastMessageIdRef.current = null;
    isFirstLoadRef.current = true;
  }, [selectedUser?.id]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    navigate(`/chat/${user.id}`);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedUser) return;
    // Страховка: не отправляем сообщение самому себе
    if (currentUser && selectedUser.id === currentUser.id) return;

    try {
      const response = await messagesAPI.create({
        text,
        recipient: selectedUser.id,
      });
      setMessages((prev) => [...prev, response.data]);
      setInput('');
      // Обновляем список собеседников: новый диалог должен появиться
      // в списке и подняться вверх по дате последнего сообщения.
      loadUsers();
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="chat__layout">
      {/* Боковая панель — список собеседников */}
      <aside className="chat__sidebar">
        <div className="chat__sidebar-title">Собеседники</div>
        {interlocutors.length === 0 ? (
          <p className="text-muted chat__sidebar-empty">
            Пока нет переписки. Начните диалог на странице «Пользователи»
          </p>
        ) : (
          <div className="chat__users-panel">
            {interlocutors.map((u) => (
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
                  <span className="chat__user-badge">{u.unread_count}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Основная область — чат */}
      <main className="chat__main">
        {!selectedUser ? (
          <div className="chat__placeholder">
            <div className="chat__empty">
              <div className="chat__empty-icon">💬</div>
              <p>Выберите собеседника</p>
              <p className="text-muted chat__empty-hint">
                Начните таинственный диалог
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Шапка чата */}
            <div className="chat__header">
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
                <div className="chat__header-status">@{selectedUser.username}</div>
              </div>
            </div>

            {/* Сообщения */}
            <div className="chat__content">
              <div className="chat__messages" ref={messagesContainerRef}>
                {messages.length === 0 ? (
                  <div className="chat__empty">
                    <div className="chat__empty-icon">🕊️</div>
                    <p>История сообщений пуста</p>
                    <p className="text-muted chat__empty-hint">
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
                  placeholder={`Написать ${selectedUser.first_name}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleSend}
                  disabled={!input.trim()}
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