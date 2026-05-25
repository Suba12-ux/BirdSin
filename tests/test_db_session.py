"""Тесты для Bird/db/session.py."""

import inspect
from unittest.mock import AsyncMock, patch

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession


class TestSession:
    """Тесты для модуля session.py."""

    def test_async_engine_exists(self):
        """Проверяем, что async_engine импортируется и является engine."""
        from Bird.db.session import async_engine
        assert isinstance(async_engine, AsyncEngine)

    def test_get_session_is_async_generator(self):
        """Проверяем, что get_session — асинхронный генератор."""
        from Bird.db.session import get_session
        assert inspect.isasyncgenfunction(get_session)

    async def test_get_session_yields_async_session(self):
        """Проверяем, что get_session возвращает AsyncSession."""
        from Bird.db.session import get_session

        mock_session = AsyncMock(spec=AsyncSession)

        # Правильный мок для async_sessionmaker как асинхронного контекстного менеджера
        mock_session_maker = AsyncMock()
        mock_session_maker.__aenter__.return_value = mock_session

        with patch("Bird.db.session.async_sessionmaker", return_value=mock_session_maker):
            async for session in get_session():
                assert session is mock_session
                break
