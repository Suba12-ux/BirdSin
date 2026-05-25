###Стек технологий
Python 3.11+
FastAPI + Uvicorn
SQLAlchemy 2.0 (асинхронный режим) + asyncpg (для PostgreSQL)
Alembic — миграции
Pydantic v2 + Pydantic-Settings — валидация и конфигурация
python-jose — JWT
passlib[bcrypt] — хеширование паролей
python-multipart — загрузка файлов (аватар)
PostgreSQL (на время разработки можно SQLite, но лучше сразу PG через Docker)
Docker / Docker Compose — для удобной инфраструктуры
Pytest + TestClient — тестирование

###Архитектура проекта
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
