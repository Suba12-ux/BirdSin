import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cookieConsentAPI } from '../api/client';

export const OPEN_COOKIE_CONSENT_EVENT = 'cookie-consent:open';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  // Баннер нужен, пока есть группы без решения
  const loadStatus = useCallback(async () => {
    try {
      const { data } = await cookieConsentAPI.status();
      setVisible(data.notAcceptedOrDeclinedCookieGroups.length > 0);
    } catch {
      setVisible(false); // backend недоступен — не мешаем пользователю
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // повторное открытие из футера/политики
  useEffect(() => {
    const handleOpen = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_CONSENT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_COOKIE_CONSENT_EVENT, handleOpen);
  }, []);

  const decide = useCallback(async (action) => {
    setBusy(true);
    try {
      await cookieConsentAPI[action]();
      await loadStatus();          // перечитываем статус с backend
    } finally {
      setBusy(false);
    }
  }, [loadStatus]);

  if (!visible) return null;

  return (
    <div className="cookie-consent-banner" role="dialog" aria-live="polite" aria-label="Согласие на использование cookie">
      <div className="cookie-consent-banner__content">
        <p className="cookie-consent-banner__title">Мы используем cookie</p>
        <p className="cookie-consent-banner__text">
          Файлы cookie нужны, чтобы сервис работал корректно, а интерфейс был
          удобнее. Подробнее — в{' '}
          <Link className="cookie-consent-banner__link" to="/privacy">
            политике конфиденциальности
          </Link>
          .
        </p>
      </div>

      <div className="cookie-consent-banner__actions">
        <button type="button" disabled={busy}
          className="btn btn--secondary btn--sm cookie-consent-decline"
          onClick={() => decide('decline')}>
          Отклонить
        </button>
        <button type="button" disabled={busy}
          className="btn btn--primary btn--sm cookie-consent-accept"
          onClick={() => decide('accept')}>
          Принять
        </button>
      </div>
    </div>
  );
}