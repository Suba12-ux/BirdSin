[![birdsin CI/CD](https://github.com/Suba12-ux/BirdSin/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/Suba12-ux/BirdSin/actions/workflows/main.yml)

# Bird — Социальная сеть / Мессенджер

Таинственный мессенджер с минималистичным интерфейсом и технологичной атмосферой.

---

## Стек технологий

| Компонент          | Технология                                      |
|--------------------|-------------------------------------------------|
| **Backend**        | Python 3.12, Django 5.1, Django REST Framework 3.15 |
| **Аутентификация** | Djoser 2.3 (Token-based)                       |
| **API Docs**       | DRF-Spectacular (Swagger UI, Redoc)            |
| **Frontend**       | React 18, Vite 5, React Router 6, Axios        |
| **База данных**    | PostgreSQL 13 (prod) / SQLite (dev/test)       |
| **WSGI-сервер**    | Gunicorn 25                                    |
| **Веб-сервер**     | Nginx (gateway + статика)                      |
| **Контейнеризация**| Docker / Docker Compose                        |
| **Тестирование**   | Pytest + pytest-django                         |
| **Линтер**         | Flake8                                         |

---

## Модели данных

### User — пользователь
Наследуется от `AbstractUser`. Вход выполняется по **email** (`USERNAME_FIELD`).

| Поле        | Тип         | Описание                  |
|-------------|-------------|---------------------------|
| email       | EmailField  | Уникальный, обязательный  |
| username    | CharField   | Никнейм                   |
| first_name  | CharField   | Имя                       |
| last_name   | CharField   | Фамилия                   |
| avatar      | ImageField  | Фото (опционально)        |

### Message — сообщение
Личное сообщение между двумя пользователями.

| Поле       | Тип         | Описание                    |
|------------|-------------|-----------------------------|
| author     | FK → User   | Отправитель                 |
| recipient  | FK → User   | Получатель                  |
| text       | TextField   | Текст (макс. 450 символов)  |
| created_at | DateTime    | Дата отправки (auto_now_add)|

### Subscription — подписка
Подписка на автора (follow). Уникальна по паре `(user, author)`.

| Поле   | Тип       | Описание     |
|--------|-----------|--------------|
| user   | FK → User | Подписчик    |
| author | FK → User | Автор        |

---

## API Endpoints

### Аутентификация (Djoser)

| Метод  | Endpoint                       | Описание                     |
|--------|--------------------------------|------------------------------|
| POST   | `/api/auth/token/login/`       | Вход (email + password → token) |
| POST   | `/api/auth/token/logout/`      | Выход (удаление токена)      |

### Пользователи

| Метод  | Endpoint                          | Описание                      |
|--------|-----------------------------------|-------------------------------|
| GET    | `/api/users/`                     | Список пользователей (только для авторизованных) |
| GET    | `/api/users/developers/`          | Авторы проекта (публично, без авторизации) |
| POST   | `/api/users/`                     | Регистрация нового            |
| GET    | `/api/users/{id}/`                | Детальная информация          |
| PATCH  | `/api/users/{id}/`                | Частичное обновление          |
| GET    | `/api/users/me/`                  | Текущий пользователь          |
| PUT    | `/api/users/me/avatar/`           | Загрузить / обновить аватар   |
| DELETE | `/api/users/me/avatar/`           | Удалить аватар                |
| GET    | `/api/users/subscriptions/`       | Список подписок               |
| POST   | `/api/users/{id}/subscribe/`      | Подписаться на автора         |
| DELETE | `/api/users/{id}/subscribe/`      | Отписаться от автора          |
| GET    | `/api/search/?email={email}`      | Поиск пользователя по email   |

### Сообщения

| Метод | Endpoint                  | Описание                         |
|-------|---------------------------|----------------------------------|
| GET   | `/api/messages/?recipient={id}` | История переписки           |
| POST  | `/api/messages/`          | Отправить сообщение              |

### Документация

| Endpoint           | Описание      |
|--------------------|---------------|
| `/api/docs/`       | Swagger UI    |
| `/api/redoc/`      | Redoc         |
| `/admin/`          | Django Admin  |

---

## Структура проекта

```
bird/
├── backend/                      # Django-приложение
│   ├── bird/                     # Конфигурация Django
│   │   ├── settings.py           # Настройки (DB, DRF, Djoser...)
│   │   ├── urls.py               # Корневые URL
│   │   ├── wsgi.py               # WSGI-точка входа
│   │   └── constants.py          # Константы (лимиты полей)
│   ├── api/                      # Основное приложение
│   │   ├── models.py             # User, Message, Subscription
│   │   ├── serializers.py        # DRF-сериализаторы
│   │   ├── views.py              # ViewSet'ы
│   │   ├── urls.py               # Маршруты API
│   │   ├── paginations.py        # Пагинация
│   │   └── migrations/           # Миграции БД
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                     # React-приложение
│   ├── src/
│   │   ├── pages/                # Login, Register, Chat, Profile, Users, Search
│   │   ├── context/              # AuthContext
│   │   ├── api/                  # Axios-клиент (client.js)
│   │   ├── components/           # Header
│   │   ├── App.jsx               # Роутинг
│   │   └── main.jsx              # Точка входа
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── infra/                        # Nginx-шлюз
│   ├── Dockerfile
│   └── nginx.conf
├── tests/                        # Pytest-тесты
│   ├── conftest.py               # Фикстуры
│   └── test_models.py            # Тесты моделей
├── data/                         # Данные (монтируемая папка)
├── docker-compose.yml
├── pytest.ini
├── setup.cfg
└── .gitignore
```

---

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd bird
```

### 2. Запустить через Docker Compose

```bash
docker compose up --build
```

Приложение будет доступно на `http://localhost:8000`.

### 3. Запуск для разработки (без Docker)

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Фронтенд на `http://localhost:3000` с прокси на бэкенд `http://localhost:8000`.

### 4. Тестирование

```bash
cd backend
pytest
```

### 5. Переменные окружения (.env)

```env
SECRET_KEY=django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# База данных (если не заданы — используется SQLite)
POSTGRES_DB=django
POSTGRES_USER=django
POSTGRES_PASSWORD=password
DB_HOST=db
DB_PORT=5432
```

---

## Разработка

- **Линтер**: `flake8 backend/`
- **Миграции**: `python manage.py makemigrations && python manage.py migrate`
- **Админка**: создайте суперпользователя (`createsuperuser`) и зайдите на `/admin/`

---