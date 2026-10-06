FROM python:3.12-slim
WORKDIR /app
RUN pip install gunicorn==25.3.0
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir
COPY . .
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py loaddata cookie_consent_default && python manage.py collectstatic --noinput && (python -u manage.py run_bot --loop &) && exec gunicorn --bind 0.0.0.0:8000 bird.wsgi"]
