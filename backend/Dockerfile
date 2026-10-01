FROM python:3.12-slim
WORKDIR /app
RUN pip install gunicorn==25.3.0
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir
COPY . .

# При старте контейнера: миграции + фикстура cookie-групп + collectstatic,
# затем запуск gunicorn (см. entrypoint.sh).
# Явно вызываем sh, чтобы избежать проблем с CRLF при сборке на Windows.
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "bird.wsgi"]
