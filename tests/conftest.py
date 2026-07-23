import pytest

from  api.models import (
    User, Message,
)

@pytest.fixture
def user(db):
    """Обычный пользователь."""
    return User.objects.create(
        username='testuser',
        email='test@mail.ru',
        first_name='TestName',
        last_name='TestLName'
    )

@pytest.fixture
def message(user, db):
    """Сообщение пользователю."""
    recipient = User.objects.create(
        username='recipientuser',
        email='recipient@mail.ru',
        first_name='Recipient',
        last_name='RecipientLName'
    )
    return Message.objects.create(
        author=user,
        recipient=recipient,
        text='Тестовое сообщение'
    )
