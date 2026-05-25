"""Тесты для Bird/db/models/__init__.py."""

from Bird.db.base import Base as BaseOriginal
from Bird.db.models import (
    User, Base
)


class TestModelsInit:
    """Тесты для инициализации моделей."""

    def test_user_exported_from_models(self):
        """Проверяем, что User экспортируется из Bird.db.models."""
        assert User is not None

    def test_base_exported_from_models(self):
        """Проверяем, что Base экспортируется из Bird.db.models."""
        assert Base is BaseOriginal
