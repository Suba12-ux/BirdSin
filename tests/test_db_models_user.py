"""Тесты для Bird/db/models/user.py."""

import pytest
from sqlalchemy.exc import IntegrityError

from Bird.db.models.user import User


class TestUserModel:
    """Тесты для модели User."""

    def test_user_model_exists(self):
        """Проверяем, что модель User импортируется."""
        assert User is not None

    def test_user_model_has_tablename(self):
        """Проверяем, что у модели User задано имя таблицы."""
        assert hasattr(User, "__tablename__")
        assert User.__tablename__ == "users"

    def test_user_model_columns(self):
        """Проверяем, что у модели User есть все необходимые колонки."""

        columns = [c.name for c in User.__table__.columns]

        assert "id" in columns
        assert "email" in columns
        assert "username" in columns
        assert "hashed_password" in columns
        assert "avatar_url" in columns
        assert "created_at" in columns
        assert "updated_at" in columns

    def test_user_model_id_is_integer_primary_key(self):
        """Проверяем, что id — первичный ключ типа Integer."""

        id_col = User.__table__.columns["id"]
        assert id_col.primary_key
        assert "INTEGER" in str(id_col.type).upper()

    def test_user_model_email_is_unique(self):
        """Проверяем, что email уникален."""

        email_col = User.__table__.columns["email"]
        assert email_col.unique

    def test_user_model_username_is_unique(self):
        """Проверяем, что username уникален."""

        username_col = User.__table__.columns["username"]
        assert username_col.unique

    def test_user_repr_method_exists(self):
        """Проверяем, что у модели есть метод __repr__."""
        
        assert hasattr(User, "__repr__")
        assert callable(User.__repr__)

    async def test_create_user_in_db(self, test_session):
        """Интеграционный тест: создание пользователя в БД."""

        user = User(
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_pass_123",
        )
        test_session.add(user)
        await test_session.commit()
        await test_session.refresh(user)

        assert user.id is not None
        assert user.id > 0

        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.hashed_password == "hashed_pass_123"
        assert user.created_at is not None
        assert user.updated_at is not None

    async def test_user_email_unique_constraint(self, test_session):
        """Интеграционный тест: проверка уникальности email."""
        user1 = User(
            email="duplicate@example.com",
            username="user1",
            hashed_password="hash1",
        )
        test_session.add(user1)
        await test_session.commit()

        user2 = User(
            email="duplicate@example.com",
            username="user2",
            hashed_password="hash2",
        )
        test_session.add(user2)
        with pytest.raises(IntegrityError):
            await test_session.commit()

    async def test_user_username_unique_constraint(self, test_session):
        """Интеграционный тест: проверка уникальности username."""
        user1 = User(
            email="user1@example.com",
            username="uniqueuser",
            hashed_password="hash1",
        )
        test_session.add(user1)
        await test_session.commit()

        user2 = User(
            email="user2@example.com",
            username="uniqueuser",
            hashed_password="hash2",
        )
        test_session.add(user2)
        with pytest.raises(IntegrityError):
            await test_session.commit()
