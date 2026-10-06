import os
import re
import time
import mimetypes
from urllib.parse import urlparse, unquote

import asyncio
import requests

from django.core.files.base import ContentFile

from api.models import BotNews
from bird.constants import MAX_LENGHT_NAME, MAX_LENGHT_NEWS
from bird.settings import (
    SK_OPENVERSE,
    CLIENT_ID_OPENVERSE,
    FLODERS,
    URL_OPENVERSE,
    URL_OPENVERSE_AUTH,
    client,
    prompt1,
    prompt2,
    prompt3,
    prompt4,
)


class Functionality:
    """Класс с функционалом для работы с Openverse API и скачивания картинок."""

    _token_cache = {"token": None, "expires_at": 0.0}

    def _get_openverse_token(self):
        """OAuth2 client credentials токен для Openverse (кэшируется)."""

        if not (CLIENT_ID_OPENVERSE and SK_OPENVERSE):
            return None

        now = time.time()
        if self._token_cache["token"] and now < self._token_cache["expires_at"]:
            return self._token_cache["token"]

        r = requests.post(
            URL_OPENVERSE_AUTH,
            data={
                "grant_type": "client_credentials",
                "client_id": CLIENT_ID_OPENVERSE,
                "client_secret": SK_OPENVERSE,
            },
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        self._token_cache["token"] = data["access_token"]
        self._token_cache["expires_at"] = now + int(data.get("expires_in", 3600)) - 60
        return self._token_cache["token"]

    async def _search_openverse(self,query, page_size):
        """Один запрос к Openverse; возвращает список найденных картинок."""

        headers = {"User-Agent": "Mozilla/5.0"}
        token = self._get_openverse_token()
        if token:
            headers["Authorization"] = f"Bearer {token}"

        r = requests.get(
            URL_OPENVERSE,
            headers=headers,
            params={"q": query, "page_size": page_size, "filter_dead": True},
            timeout=15,
        )
        r.raise_for_status()
        return r.json().get("results") or []

    async def get_image_by_description(self, description, page_size=5):
        """Ищет картинки по описанию через Openverse API.

        Возвращает список результатов (каждый — dict с ключами url, thumbnail,
        attribution и др.) или None, если ничего не найдено.
        """

        query = re.sub(r"[^\w\s]", " ", description)
        query = re.sub(r"\s+", " ", query).strip()

        candidates = [query] if query else []
        words = query.split()
        if len(words) >= 3:
            candidates.append(" ".join(words[:2]))
        if words:
            candidates.append(words[0])

        for q in candidates:
            results = await self._search_openverse(q, page_size)
            if results:
                return results

        return None

    def make_filename(self, url, folder=FLODERS):
        """Безопасное, короткое имя файла из URL."""

        raw = os.path.basename(urlparse(url).path)
        raw = unquote(raw)
        base, ext = os.path.splitext(raw)

        if not base:
            base = "image"

        base = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", base)
        base = base.strip(" .") or "image"

        base = base[:100]

        if not ext:
            ext = ".jpg"

        return base + ext

    async def download_image(self, url, folder=FLODERS):
        """Скачивает картинку. Принимает URL-строку или список URL-запасных вариантов."""

        os.makedirs(folder, exist_ok=True)

        urls = [url] if isinstance(url, str) else list(url)
        last_error = None

        for current in urls:
            headers = {"User-Agent": "Mozilla/5.0"}
            try:
                r = requests.get(current, headers=headers, stream=True, timeout=10)
                r.raise_for_status()
            except requests.RequestException as e:
                last_error = e
                continue

            filename = self.make_filename(current, folder)
            base, ext = os.path.splitext(filename)
            if not ext:
                ctype = r.headers.get("Content-Type", "").split(";")[0].strip()
                ext = mimetypes.guess_extension(ctype) or ""
                if ext == ".jpe":
                    ext = ".jpg"
                if not ext:
                    ext = ".jpg"
                filename = base + ext

            filepath = os.path.join(folder, filename)

            with open(filepath, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)

            return filepath

        raise last_error

    async def reuestai(
        self,
        prompt: str,
    ):
        response = await client.chat.completions.create(
            model="deepseek-flash",
            messages=[
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content": prompt},
            ],
            stream=False,
            reasoning_effort="high",
            extra_body={"thinking": {"type": "enabled"}}
        )
        return response.choices[0].message.content

    async def generate_bot_post(self, bot):
        """Генерирует и сохраняет новость бота: название, текст и картинку.

        Возвращает созданный объект BotNews. Ошибки внешних сервисов
        (AI/Openverse/скачивание) не роняют процесс — картинка становится
        опциональной, а название и текст сохраняются всегда.
        """

        topic = (await self.reuestai(prompt2)).strip()
        text = (await self.reuestai(prompt4 + topic)).strip()
        image_description = (await self.reuestai(prompt3 + topic)).strip()

        image_content = None
        image_name = None

        # Основной источник картинки — поиск по Openverse.
        results = await self.get_image_by_description(image_description)
        image_url = results[0].get('url') if results else None

        # Запасной вариант — просим AI вернуть прямую ссылку на картинку.
        if not image_url:
            try:
                image_url = (await self.reuestai(
                    prompt1 + image_description
                )).strip()
            except Exception:
                image_url = None

        if image_url:
            try:
                filepath = await self.download_image(image_url)
                with open(filepath, 'rb') as fh:
                    image_content = fh.read()
                image_name = os.path.basename(filepath)
                try:
                    os.remove(filepath)
                except OSError:
                    pass
            except Exception:
                image_content = None
                image_name = None

        image_file = (
            ContentFile(image_content, name=image_name)
            if image_content is not None else None
        )

        news = await asyncio.to_thread(
            BotNews.objects.create,
            bot_user=bot,
            news=topic[:MAX_LENGHT_NAME],
            text_news=text[:MAX_LENGHT_NEWS],
            image=image_file,
        )
        return news
