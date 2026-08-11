import { useEffect, useRef } from 'react';

/**
 * usePoll — универсальный хук для опроса (polling) сервера.
 *
 * @param {Function} callback — асинхронная функция для периодического вызова
 * @param {number} interval — интервал в миллисекундах (по умолчанию 5000)
 * @param {Array} deps — зависимости, при изменении которых интервал перезапускается
 * @param {Object} options
 * @param {boolean} options.immediate — вызвать callback сразу (по умолчанию true)
 * @param {boolean} options.enabled — включён ли polling (по умолчанию true)
 */
export function usePoll(callback, interval = 5000, deps = [], options = {}) {
  const { immediate = true, enabled = true } = options;
  const savedCallback = useRef(callback);
  const inFlight = useRef(false);

  // Всегда держим актуальный callback без перезапуска интервала
  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const tick = async () => {
      // Не запускаем новый запрос, пока предыдущий ещё выполняется
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        await savedCallback.current?.();
      } finally {
        inFlight.current = false;
      }
    };

    if (immediate) tick();

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
    // Зависимости разворачиваем намеренно — по ним перезапускается таймер
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, interval, immediate, ...deps]);
}
