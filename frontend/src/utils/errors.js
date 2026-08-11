/**
 * Утилиты для работы с ошибками DRF-бэкенда.
 */

/**
 * Достаёт человекочитаемое сообщение из ответа об ошибке.
 */
export function getErrorMessage(err, fallback = 'Что-то пошло не так') {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.non_field_errors?.[0]) return data.non_field_errors[0];

  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue)) return firstValue[0];
  if (typeof firstValue === 'string') return firstValue;
  return fallback;
}

/**
 * Преобразует ошибки валидации полей DRF в объект { поле: сообщение }.
 */
export function mapFieldErrors(err) {
  const data = err?.response?.data || {};
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  );
}
