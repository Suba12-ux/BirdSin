from django.contrib.auth.models import AbstractUser
from django.db import models

from bird.constants import (
    MAX_LENGHT_EMAIL,
    MAX_LENGHT_NAME,
    MAX_LENGHT_MESSAGE
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

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ('username',)

    def __str__(self):
        return self.get_full_name() or self.username


class Message(models.Model):
    """Класс сообщений."""

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Автор'
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name='Получатель'
    )
    message = models.TextField(
        verbose_name='Сообщение',
        max_length=MAX_LENGHT_MESSAGE
    )

    class Meta:
        default_related_name = 'messages'


