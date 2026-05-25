# Bird — Социальная сеть

API для социальной сети на **FastAPI** с асинхронной архитектурой.

---
## Стек технологий

| Технология | Назначение |
|---|---|
| Python 3.11+ | Язык разработки |
| FastAPI + Uvicorn | Веб-фреймворк и ASGI-сервер |
| SQLAlchemy 2.0 + asyncpg | ORM и драйвер PostgreSQL |
| Alembic | Миграции базы данных |
| Pydantic v2 + Pydantic-Settings | Валидация данных и конфигурация |
| python-jose | JWT-токены |
| passlib[bcrypt] | Хеширование паролей |
| python-multipart | Загрузка файлов |
| PostgreSQL | База данных |
| Docker / Docker Compose | Контейнеризация |
| Pytest + TestClient | Тестирование |

---
## Архитектура проекта
```bush
    social_network/
    ├── Bird/                     # Основной код приложения
    │   ├── api/                  # Всё, что связано с маршрутами
    │   │   ├── v1/               # Версионирование API (на будущее)
    │   │   │   ├── endpoints/    # Роутеры (контроллеры)
    │   │   │   │   ├── auth.py
    │   │   │   │   ├── users.py
    │   │   │   │   ├── posts.py
    │   │   │   │   └── subscriptions.py
    │   │   │   └── __init__.py
    │   │   └── deps.py           # Зависимости (получить БД, текущего пользователя)
    │   ├── core/                 # Конфигурация, безопасность, константы
    │   │   ├── config.py         # Настройки из env (Pydantic Settings)
    │   │   └── security.py       # Хеширование паролей, создание/проверка JWT
    │   ├── db/                   # База данных
    │   │   ├── base.py           # Декларативная база моделей
    │   │   ├── session.py        # Подключение, создание сессии
    │   │   └── models/           # SQLAlchemy модели таблиц
    │   │       ├── user.py
    │   │       ├── post.py
    │   │       └── subscription.py
    │   ├── schemas/              # Pydantic-схемы (запрос/ответ)
    │   │   ├── user.py
    │   │   ├── post.py
    │   │   └── token.py
    │   ├── services/             # Бизнес-логика (взаимодействие с БД)
    │   │   ├── user.py
    │   │   ├── post.py
    │   │   └── subscription.py
    │   └── main.py               # Точка входа, создание app, подключение роутеров
    ├── alembic/                  # Миграции Alembic (генерируется)
    │   ├── versions/
    │   └── env.py
    ├── static/                   # Статика (аватарки, позже — медиа)
    ├── tests/                    # Тесты
    ├── .env                      # Локальные переменные окружения
    ├── .gitignore
    ├── requirements.txt
    ├── alembic.ini
    └── docker-compose.yml        # (для PostgreSQL и запуска)
```