import { Link } from 'react-router-dom';

/* ===== Импорт SVG-файлов из папки templates ===== */
import telegramIcon from '../../templates/telegram-svgrepo-com.svg';
import githubIcon from '../../templates/github-svgrepo-com (1).svg';
import setkaIcon from '../../templates/connect-groups-meetup-svgrepo-com.svg';

function TechBadge({ label, color = 'var(--accent-cyan)' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.35rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-input)',
        border: `1px solid ${color}`,
        color,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        fontWeight: 500,
        boxShadow: `0 0 12px ${color.replace(')', '')}15)`,
      }}
    >
      {label}
    </span>
  );
}

export function About() {
  return (
    <div className="page" style={{ paddingTop: '2rem' }}>
      <div className="page__container page__container--wide">
        {/* Заголовок */}
        <h1 className="page__title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Об авторе
        </h1>
        <p className="page__subtitle" style={{ marginBottom: '2rem' }}>
          Кто стоит за Bird и какие технологии оживляют этот проект
        </p>

        {/* ===== Карточка — Обо мне ===== */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Аватар */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
              }}
            >
              СУ
            </div>

            {/* Имя и ссылки (SVG-иконки) */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.15rem' }}>
                Субхон
              </h2>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.5rem',
                }}
              >
                backend-разработчик / энтузиаст
              </p>

              {/* Иконки со ссылками */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                {/* Telegram */}
                <a
                  href="https://t.me/SEmomov"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Telegram @SEmomov"
                  style={{
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 0 10px var(--accent-cyan-glow)';
                    e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <img
                    src={telegramIcon}
                    alt="Telegram"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/Suba12-ux"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub @Suba12-ux"
                  style={{
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 0 10px var(--accent-purple-glow)';
                    e.currentTarget.style.borderColor = 'var(--accent-purple)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <img
                    src={githubIcon}
                    alt="GitHub"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </a>

                {/* Setka */}
                <a
                  href="https://setka.ru/users/32208b80-24d0-4075-bae6-a7965f4f61bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Setka Profile"
                  style={{
                    transition: 'all var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 0 10px var(--accent-cyan-glow)';
                    e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <img
                    src={setkaIcon}
                    alt="Setka"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </a>
              </div>
            </div>
          </div>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              marginBottom: '0.75rem',
            }}
          >
            Привет! Я Субхон — разработчик, который верит, что технологии способны 
            стирать границы и объединять людей. <strong style={{ color: 'var(--text-primary)' }}>Bird</strong> — 
            не просто очередной мессенджер. Это эксперимент, рождённый на стыке 
            минимализма, мистики и современных веб-технологий.
          </p>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.8,
            }}
          >
            Каждая строчка кода здесь написана с мыслью о том, чтобы сделать 
            общение лёгким, безопасным и чуточку магическим. Я вкладываю душу 
            в этот проект, и он живёт, дышит и развивается.
          </p>
        </div>

        {/* ===== Карточка — Технологии ===== */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Стек технологий</h3>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              marginBottom: '1rem',
            }}
          >
            <TechBadge label="React 18" color="var(--accent-cyan)" />
            <TechBadge label="Vite" color="var(--accent-cyan)" />
            <TechBadge label="React Router" color="var(--accent-cyan)" />
            <TechBadge label="Django" color="var(--accent-purple)" />
            <TechBadge label="Django REST" color="var(--accent-purple)" />
            <TechBadge label="PostgreSQL" color="var(--accent-cyan)" />
            <TechBadge label="Docker" color="var(--accent-purple)" />
            <TechBadge label="Nginx" color="var(--accent-cyan)" />
          </div>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.7,
              fontFamily: 'var(--font-mono)',
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            Frontend: React 18 + Vite + React Router DOM<br />
            Backend: Django 5 + DRF + PostgreSQL<br />
            Инфра: Docker + Nginx + Gunicorn
          </p>
        </div>

        {/* ===== Карточка — Вдохновляющая речь ===== */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>🕊️ О проекте</h3>

          <div style={{ position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid var(--accent-cyan)' }}>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: 1.9,
                fontStyle: 'italic',
                marginBottom: '1rem',
              }}
            >
              «В мире, где каждый кричит, чтобы быть услышанным, истинная сила — 
              в умении слушать. Bird создан не для шума. Он — для тишины, 
              в которой рождаются настоящие разговоры. Каждое сообщение здесь — 
              как птица в небе: оно появляется из ниоткуда, оставляет след 
              и исчезает, меняя того, кто его увидел.»
            </p>
          </div>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: 1.8,
            }}
          >
            Bird — это пространство, где технологии встречаются с человечностью. 
            Здесь нет лишнего: только ты, твой собеседник и магия момента. 
            Проект постоянно растёт, обрастает новыми возможностями и идеями. 
            Но главное — он ищет своих людей.
          </p>
        </div>

        {/* ===== Карточка — Призыв к команде ===== */}
        <div
          className="glass-card"
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
            borderColor: 'var(--accent-cyan)',
            boxShadow: '0 0 30px rgba(0, 240, 255, 0.08), var(--shadow-card)',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '0.75rem',
              lineHeight: 1,
            }}
          >
          </div>
          <h3 style={{ marginBottom: '0.75rem' }}>Я ищу команду</h3>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              maxWidth: '480px',
              margin: '0 auto 1.25rem',
            }}
          >
            Одиночный полёт — это красиво, но вместе мы сможем подняться выше. 
            Если тебе откликается идея Bird, если ты хочешь создавать что-то 
            настоящее и атмосферное — <strong style={{ color: 'var(--text-primary)' }}>присоединяйся</strong>.
          </p>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              marginBottom: '1.25rem',
            }}
          >
            Мне нужны единомышленники: фронтендеры, бэкендеры, дизайнеры — 
            все, кому не всё равно. Давай делать Bird лучше вместе!
          </p>

          {/* Кнопка-ссылка на Telegram */}
          <a
            href="https://t.me/SEmomov"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <img
              src={telegramIcon}
              alt="Telegram"
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.9rem' }}>Написать в Telegram</span>
          </a>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginTop: '1rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            @SEmomov — всегда на связи
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/chat" className="btn btn--secondary">
            ← Вернуться в чат
          </Link>
        </div>
      </div>
    </div>
  );
}
