from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, NewsUser, BotUser, BotNews


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Админ-панель для управления пользователями."""

    ADDITIONAL_USER_FIELDS = (
        (
            None,
            {
                'fields': ('avatar', 'is_developer')
            }
        ),
    )
    fieldsets = BaseUserAdmin.fieldsets + ADDITIONAL_USER_FIELDS
    search_fields = ('username', 'email',)
    list_display = (
        'username', 'email',
        'is_developer', 'is_staff',
        'is_active'
    )
    list_filter = (
        'is_staff',
        'is_active',
        'is_developer'
    )
    ordering = ('username',)


@admin.register(NewsUser)
class NewsUserAdmin(admin.ModelAdmin):
    """Админ-панель для модерации новостей пользователей.

    Закрепление на главной (is_publish_on_top) доступно только тем,
    у кого есть право 'api.change_newsuser' (суперпользователь,
    staff с правом или участник группы). Остальные пользователи
    это поле не видят и изменить не могут.
    """

    list_display = (
        'id', 'author', 'news',
        'is_publish_on_top', 'created_at'
    )
    list_editable = ('is_publish_on_top',)
    list_filter = ('is_publish_on_top', 'created_at')
    search_fields = (
        'news', 'text_news',
        'author__username', 'author__email'
    )
    list_select_related = ('author',)
    ordering = ('-is_publish_on_top', '-created_at')


@admin.register(BotUser)
class BotUserAdmin(admin.ModelAdmin):
    """Админ-панель для ботов.

    Бот создаётся только здесь: выбирается пользователь-владелец,
    задаётся интервал публикации и активность.
    """

    list_display = ('id', 'user', 'interval', 'is_active', 'last_post_at')
    list_editable = ('interval', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('user__username', 'user__email')
    raw_id_fields = ('user',)


@admin.register(BotNews)
class BotNewsAdmin(admin.ModelAdmin):
    """Админ-панель для новостей бота (преимущественно просмотр)."""

    list_display = (
        'id', 'bot_user', 'news', 'is_publish_on_top', 'created_at'
    )
    list_filter = ('is_publish_on_top', 'created_at')
    search_fields = ('news', 'text_news', 'bot_user__user__username')
    list_select_related = ('bot_user__user',)
    ordering = ('-created_at',)
