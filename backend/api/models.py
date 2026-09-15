from django.contrib.auth.models import AbstractUser
from django.db import models

from bird.constants import (
    MAX_LENGHT_EMAIL,
    MAX_LENGHT_NAME,
    MAX_LENGHT_MESSAGE,
    MAX_LENGHT_NEWS
)


class User(AbstractUser):
    """Обновленная пользовательская модель."""

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [
        'username', 'first_name', 'last_name'
    ]

    avatar = models.ImageField(
        verbose_name='Фото',
        blank=True,
        null=True
    )
    email = models.EmailField(
        verbose_name='Email',
        max_length=MAX_LENGHT_EMAIL,
        unique=True,
    )
    first_name = models.CharField(
        verbose_name='Имя',
        max_length=MAX_LENGHT_NAME,
    )
    last_name = models.CharField(
        verbose_name='Фамилия',
        max_length=MAX_LENGHT_NAME,
    )
    is_developer = models.BooleanField(
        verbose_name='Разработчик',
        default=False
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ('username',)

    def __str__(self):
        return self.get_full_name() or self.username


class Message(models.Model):
    """Модель соодщения пользователей."""

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name='Автор'
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages',
        verbose_name='Получатель'
    )
    text = models.TextField(
        verbose_name='Текст сообщения',
        max_length=MAX_LENGHT_MESSAGE,
    )
    created_at = models.DateTimeField(
        verbose_name='Дата отправки',
        auto_now_add=True,
    )
    is_read = models.BooleanField(
        verbose_name='Прочитано',
        default=False,
    )

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ('created_at',)

    def __str__(self):
        return f'Диалог между {self.author}/{self.recipient}'


class Subscription(models.Model):
    """Модель подписок на авторов."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='follower',
        verbose_name='Подписчик'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following',
        verbose_name='Автор'
    )

    class Meta:
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'author'],
                name='unique_subscription'
            )
        ]

    def __str__(self):
        return f'{self.user} подписан на {self.author}'


class NewsUser(models.Model):
    """Новости пользоваетелей."""

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='news',
        verbose_name='Автор',
    )
    news = models.TextField(
        verbose_name='Название новости.',
        max_length=MAX_LENGHT_NAME,
    )
    text_news = models.TextField(
        verbose_name='Описание новости.',
        max_length=MAX_LENGHT_NEWS
    )
    image = models.ImageField(
        verbose_name='Фото',
        blank=True,
        null=True
    )
    is_publish_on_top = models.BooleanField(
        verbose_name='Публикация на главной странице',
        default=False,
    )
    created_at = models.DateTimeField(
        verbose_name='Дата создания',
        auto_now_add=True,
    )
