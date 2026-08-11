/**
 * Возвращает инициалы пользователя для аватара по умолчанию:
 * «Иван Иванов» -> «ИИ», иначе первая буква email, иначе «?».
 */
export function getInitials(user) {
  if (!user) return '?';

  const fromName = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.trim();
  return fromName || user.email?.[0]?.toUpperCase() || '?';
}
