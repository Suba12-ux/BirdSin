import { useEffect, useRef } from 'react';

/**
 * usePoll — универсальный хук для опроса (polling) сервера.
 *
 * @param {Function} callback — асинхронная функция, которая будет вызываться
 * @param {number} interval — интервал в миллисекундах (по умолчанию 5000)
 * @param {Array} deps — зависимости, при изменении которых перезапускается интервал
 * @param {Object} options
 * @param {boolean} options.immediate — вызвать callback сразу (по умолчанию true)
 * @param {boolean} options.enabled — включён ли polling (по умолчанию true)
 */
export function usePoll(callback, interval = 5000, deps = [], options = {}) {
  const { immediate = true, enabled = true } = options;
  const savedCallback = useRef(callback);

  // Сохраняем актуальный callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedCallback.current?.();
    };

    // Вызываем сразу при монтировании (если нужно)
    if (immediate) {
      tick();
    }

    // Запускаем интервал
    const id = setInterval(tick, interval);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, interval, immediate, ...deps]);
}
