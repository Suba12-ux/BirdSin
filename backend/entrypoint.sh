#!/bin/sh
set -e

# Применяем миграции БД
python manage.py migrate --noinput

# Загружаем группы cookie (required / analytics / social). Без этих записей
# эндпоинт /cookies/status/ возвращает пустой notAcceptedOrDeclinedCookieGroups,
# и баннер согласия на фронтенде никогда не появляется.

# Берём собственную фикстуру (api/fixtures), а НЕ штатную common_cookies
# из пакета cookie_consent: у неё cookie.description = null, что падает на
# PostgreSQL (в модели поле TextField(blank=True) без null=True).
python manage.py loaddata cookie_consent_default

# Собираем статику Django (админка и т.п.)
python manage.py collectstatic --noinput

# Запускаем переданную команду (по умолчанию — gunicorn из CMD)
exec "$@"
