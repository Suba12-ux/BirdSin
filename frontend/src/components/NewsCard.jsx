import { Link } from 'react-router-dom';
import { getInitials, formatDate } from '../utils/format';

/**
 * NewsCard — карточка новости.
 *
 * @param {Object} news — объект новости из API
 * @param {Object} author — объект пользователя-автора (для аватара и имени)
 * @param {boolean} canDelete — показывать ли кнопку удаления
 * @param {boolean} canEdit — показывать ли кнопку редактирования
 * @param {Function} onDelete — обработчик удаления (получает id новости)
 * @param {Function} onEdit — обработчик редактирования (получает id новости)
 */
export function NewsCard({
  news,
  author,
  canDelete = false,
  canEdit = false,
  onDelete,
  onEdit,
}) {
  return (
    <article className="news-card glass-card">
      <div className="news-card__header">
        {author && (
          <Link to={`/chat/${author.id}`} className="news-card__author">
            <div className="news-card__avatar">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={`${author.first_name} ${author.last_name}`}
                />
              ) : (
                getInitials(author)
              )}
            </div>
            <div className="news-card__author-info">
              <div className="news-card__author-name truncate">
                {author.first_name} {author.last_name}
              </div>
              <div className="news-card__author-username">@{author.username}</div>
            </div>
          </Link>
        )}
        <span className="news-card__date">{formatDate(news.created_at)}</span>
      </div>

      {news.image && (
        <div className="news-card__image">
          <img src={news.image} alt={news.news} />
        </div>
      )}

      <h3 className="news-card__title">{news.news}</h3>
      <p className="news-card__text">{news.text_news}</p>

      {(canDelete || canEdit) && (
        <div className="news-card__actions">
          {canEdit && (
            <button
              type="button"
              className="btn btn--ghost btn--sm news-card__edit"
              onClick={() => onEdit?.(news.id)}
              title="Редактировать"
              aria-label="Редактировать новость"
            >
              <img
                src="/templates/pencil-svgrepo-com.svg"
                alt=""
                className="news-card__edit-icon"
              />
              Редактировать
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => onDelete?.(news.id)}
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </article>
  );
}
