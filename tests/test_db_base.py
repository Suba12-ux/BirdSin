"""Тесты для Bird/db/base.py."""
from sqlalchemy.orm import DeclarativeBase

from Bird.db.base import Base


class TestBase:
    """Тесты для декларативной базы моделей."""

    def test_base_has_metadata(self):
        """Проверяем, что Base имеет атрибут metadata."""
        assert hasattr(Base, "metadata")
        assert Base.metadata is not None

    def test_base_is_registered(self):
        """Проверяем, что Base является декларативным базовым классом SQLAlchemy."""
        assert issubclass(Base, DeclarativeBase)
