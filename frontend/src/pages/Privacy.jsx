import { Link } from 'react-router-dom';
import { OPEN_COOKIE_CONSENT_EVENT } from '../components/CookieConsent';

/** Дата последнего обновления политики. Меняйте при правках текста. */
const LAST_UPDATED = '18 сентября 2026 г.';

/**
 * Privacy — статическая страница политики конфиденциальности.
 * Доступна без авторизации и содержит ссылку на повторное открытие
 * баннера cookie.
 */
export function Privacy() {
  const openCookieSettings = () => {
    window.dispatchEvent(new Event(OPEN_COOKIE_CONSENT_EVENT));
  };

  return (
    <div className="page privacy">
      <div className="page__container page__container--wide">
        <div className="glass-card privacy__card">
          <h1 className="page__title">Политика конфиденциальности</h1>
          <p className="privacy__meta">Последнее обновление: {LAST_UPDATED}</p>

          <section className="privacy__section">
            <h2 className="privacy__heading">1. Общие положения</h2>
            <p className="privacy__text">
              Настоящая политика описывает, какие данные собирает сервис
              <strong className="privacy__accent"> Bird</strong>, как мы их
              используем и защищаем. Пользуясь сервисом, вы соглашаетесь с
              условиями этой политики.
            </p>
          </section>

          <section className="privacy__section">
            <h2 className="privacy__heading">2. Какие данные мы собираем</h2>
            <ul className="privacy__list">
              <li>данные аккаунта: имя, фамилия, email, имя пользователя, аватар;</li>
              <li>содержимое сообщений и публикаций, которые вы создаёте;</li>
              <li>технические данные: тип браузера, язык, IP-адрес, время обращения.</li>
            </ul>
          </section>

          <section className="privacy__section">
            <h2 className="privacy__heading">3. Файлы cookie</h2>
            <p className="privacy__text">
              Cookie — небольшие файлы, которые сайт сохраняет в браузере.
              Мы используем их минимально и не применяем для рекламы:
            </p>
            <ul className="privacy__list">
              <li>
                <strong className="privacy__accent">cookie_consent</strong> —
                хранит ваше решение о согласии (обязательная);
              </li>
              <li>
                <strong className="privacy__accent">csrftoken</strong> —
                защищает формы от подделки запросов (обязательная);
              </li>
              <li>
                <strong className="privacy__accent">sessionid</strong> —
                нужна только для входа в административную панель (обязательная).
              </li>
            </ul>
            <p className="privacy__text">
              Данные авторизации (токен) и выбранная тема оформления хранятся в
              браузере в localStorage и файлами cookie не являются. Обязательные
              cookie нужны для работы сервиса, отключить их нельзя. Необязательные
              категории (аналитика, соцсети) устанавливаются только после вашего
              согласия — их можно отклонить. Изменить решение можно в любой момент.
            </p>
            {/* <button
              type="button"
              className="btn btn--secondary btn--sm privacy__cookie-btn"
              onClick={openCookieSettings}
            >
              Настроить cookie
            </button> */}
          </section>

          <section className="privacy__section">
            <h2 className="privacy__heading">4. Как мы используем данные</h2>
            <ul className="privacy__list">
              <li>для предоставления доступа к функциям сервиса;</li>
              <li>для отображения вашего профиля и публикаций другим пользователям;</li>
              <li>для защиты сервиса и предотвращения злоупотреблений.</li>
            </ul>
          </section>

          <section className="privacy__section">
            <h2 className="privacy__heading">5. Хранение и защита</h2>
            <p className="privacy__text">
              Данные хранятся на защищённых серверах. Доступ к ним ограничен и
              предоставляется только для решения задач сервиса. Мы не передаём
              ваши данные третьим лицам, кроме случаев, предусмотренных законом.
            </p>
          </section>

          <section className="privacy__section">
            <h2 className="privacy__heading">6. Ваши права</h2>
            <p className="privacy__text">
              Вы можете изменить или удалить данные профиля в разделе
              «Профиль», а также запросить удаление аккаунта, связавшись с нами.
            </p>
          </section>

          <section className="privacy__section">
            <h2 className="privacy__heading">7. Контакты</h2>
            <p className="privacy__text">
              По вопросам обработки персональных данных пишите авторам проекта —
              контакты указаны на странице
              <Link className="privacy__link" to="/about"> «О проекте»</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
