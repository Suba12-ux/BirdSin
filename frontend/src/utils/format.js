/**
 * Возвращает инициалы пользователя для аватара по умолчанию:
 * «Иван Иванов» -> «ИИ», иначе первая буква email, иначе «?».
 */
export function getInitials(user) {
  if (!user) return '?';

  const fromName = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.trim();
  return fromName || user.email?.[0]?.toUpperCase() || '?';
}

/**
 * Форматирует дату (строка/Date) в человекочитаемый вид «13 августа 2026 г.».
 * Если дату разобрать не удалось — возвращает исходное значение.
 */
export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
