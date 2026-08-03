import pytest

from api.models import (
    User, Message, Subscription
)


@pytest.mark.django_db
class TestUserModel:
    """Тесты модели User."""

    def test_create_user(self, user):
        """Проверяем, что пользователь создаётся корректно."""
        assert user.email == 'test@mail.ru'
        assert user.first_name == 'TestName'
        assert user.last_name == 'TestLName'
        assert user.is_active  # По умолчанию True
        assert not user.is_staff  # По умолчанию False
        assert str(user) == user.get_full_name()

    def test_user_str(self, user):
        """Проверяем строковое представление пользователя."""
        assert str(user) == 'TestName TestLName'

    def test_user_without_first_name(self, db):
        """Проверяем __str__ без first_name / last_name."""
        user = User.objects.create(
            username='testuser',
            email='no_name@mail.ru',
            first_name='',
            last_name=''
        )
        assert str(user) == 'testuser'


@pytest.mark.django_db
class TestMessageModel:
    """Тесты модели Message."""

    def test_create_message(self, message):
        """Проверяем создание сообщения."""
        assert message.text == 'Тестовое сообщение'
        assert message.author.email == 'test@mail.ru'
        assert message.recipient.email == 'recipient@mail.ru'
        assert message.created_at is not None  # auto_now_add

    def test_message_relations(self, user, db):
        """Проверяем related_name."""
        recipient = User.objects.create(
            email='recipient2@mail.ru',
            first_name='R',
            last_name='R'
        )
        msg = Message.objects.create(
            author=user,
            recipient=recipient,
            text='Ещё одно сообщение'
        )
        # Через related_name
        assert msg in user.sent_messages.all()
        assert msg in recipient.received_messages.all()

    def test_message_ordering(self, message, db):
        """Проверяем ordering по created_at."""
        # Создаём второе сообщение позже
        import time
        time.sleep(0.01)
        msg2 = Message.objects.create(
            author=message.author,
            recipient=message.recipient,
            text='Второе сообщение'
        )
        messages = Message.objects.all()
        assert list(messages) == [message, msg2]


@pytest.mark.django_db
class TestSubscriptionModel:
    """Тесты модели Subscription."""

    def test_create_subscription(self, user, db):
        """Проверяем создание подписки."""
        author = User.objects.create(
            email='author@mail.ru',
            first_name='Author',
            last_name='AuthorLName'
        )
        subscription = Subscription.objects.create(
            user=user,
            author=author
        )
        assert subscription.user == user
        assert subscription.author == author
        assert str(subscription) == 'TestName TestLName подписан на Author AuthorLName'

    def test_unique_subscription_constraint(self, user, db):
        """Проверяем, что нельзя подписаться на одного автора дважды."""
        author = User.objects.create(
            email='author@mail.ru',
            first_name='Author',
            last_name='LName'
        )
        Subscription.objects.create(user=user, author=author)

        with pytest.raises(Exception):  # Django вызовет IntegrityError
            Subscription.objects.create(user=user, author=author)

    def test_subscription_relations(self, user, db):
        """Проверяем related_name для подписок."""
        author = User.objects.create(
            email='author@mail.ru',
            first_name='A',
            last_name='B'
        )
        sub = Subscription.objects.create(user=user, author=author)

        # Подписчик видит свои подписки через 'follower'
        assert sub in user.follower.all()

        # Автор видит своих подписчиков через 'following'
        assert sub in author.following.all()